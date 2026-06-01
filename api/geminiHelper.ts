import { GoogleGenAI } from "@google/genai";

// Inicializador preguiçoso do cliente Gemini para evitar cold starts desnecessários
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("A chave de API GEMINI_API_KEY não foi configurada no ambiente.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Verifica se um erro do Gemini SDK ou da rede da Google é elegível para retry
 * (Erros 429 - Cota Excedida / Erros 503 - Serviço Indisponível/Alta Demanda)
 */
function isRetryableError(err: any): boolean {
  const code = Number(err?.code) || err?.status || 0;
  const status = err?.status || "";
  const message = err?.message || "";

  return (
    code === 429 ||
    code === 503 ||
    status === "RESOURCE_EXHAUSTED" ||
    status === "UNAVAILABLE" ||
    message.toLowerCase().includes("demand") ||
    message.toLowerCase().includes("overloaded") ||
    message.toLowerCase().includes("exhausted") ||
    message.toLowerCase().includes("unavailable")
  );
}

interface GenerateOptions {
  primaryModel: string;
  fallbackModel: string;
  contents: any;
  systemInstruction?: string;
  temperature?: number;
}

/**
 * Função executora de chamadas ao Gemini com lógica de Retry Simples (máx. 2 tentativas)
 * e chaveamento para Modelo de Fallback se a falha persistir.
 */
export async function generateContentWithRetry(options: GenerateOptions): Promise<string> {
  const { primaryModel, fallbackModel, contents, systemInstruction, temperature = 0.7 } = options;
  const client = getGeminiClient();

  const configObj: any = {
    temperature,
  };
  if (systemInstruction) {
    configObj.systemInstruction = systemInstruction;
  }

  // ---- TENTATIVA 1: Modelo Principal ----
  try {
    const response = await client.models.generateContent({
      model: primaryModel,
      contents,
      config: configObj,
    });
    if (response.text) return response.text;
  } catch (err: any) {
    console.warn(`[Gemini Helper] Falha na Tentativa 1 com o modelo principal (${primaryModel}):`, err.message || err);

    if (!isRetryableError(err)) {
      // Se não for um erro temporário (ex: chave de API incorreta, erro de schema, etc.), lança na hora
      throw err;
    }

    // ---- TENTATIVA 2: Retry Simples no Modelo Principal após delay ----
    const waitTime = Math.floor(Math.random() * 500) + 500; // Entre 500ms e 1000ms
    console.log(`[Gemini Helper] Erro passível de retry detectado. Aguardando ${waitTime}ms antes da segunda tentativa...`);
    await delay(waitTime);

    try {
      const response = await client.models.generateContent({
        model: primaryModel,
        contents,
        config: configObj,
      });
      if (response.text) return response.text;
    } catch (retryErr: any) {
      console.warn(`[Gemini Helper] Falha na Tentativa 2 com o modelo principal (${primaryModel}):`, retryErr.message || retryErr);
      
      // Se a segunda tentativa falhar, caímos na estratégia de chaveamento para o Modelo de Fallback
    }
  }

  // ---- TENTATIVA 3: Chaveamento de Contingência para o Modelo Fallback ----
  console.log(`[Gemini Helper] Ativando Modelo de Fallback (${fallbackModel}) de contingência...`);
  try {
    const response = await client.models.generateContent({
      model: fallbackModel,
      contents,
      config: configObj,
    });
    if (response.text) {
      console.log(`[Gemini Helper] Sucesso obtido através do modelo de fallback (${fallbackModel}).`);
      return response.text;
    }
  } catch (fallbackErr: any) {
    console.error(`[Gemini Helper] Falha crítica também no modelo de fallback (${fallbackModel}):`, fallbackErr.message || fallbackErr);
    // Propaga o erro geral
    throw fallbackErr;
  }

  throw new Error("A IA não conseguiu formular uma resposta válida.");
}
