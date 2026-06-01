import { GoogleGenAI } from "@google/genai";

// Inicializador preguiçoso do cliente Gemini
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("A chave de API GEMINI_API_KEY não foi configurada nas variáveis de ambiente da Vercel.");
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

export default async function handler(req: any, res: any) {
  // Regra 3: Rejeitar qualquer método que não seja POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} não permitido. Utilize requisições POST.` });
  }

  try {
    const { caseTitle, caseCategory, caseDescription, caseNumber } = req.body;
    if (!caseTitle || !caseDescription) {
      return res.status(400).json({ error: "Título e descrição do processo são obrigatórios." });
    }

    const client = getGeminiClient();

    const prompt = `Analise tecnicamente o seguinte processo jurídico que está sendo acompanhado:
- Número do Processo: ${caseNumber || "Não listado / Em petição inicial"}
- Título/Tema do Caso: ${caseTitle}
- Área de Interesse: ${caseCategory}
- Detalhes dadas pelo cliente: ${caseDescription}

Por favor, elabore um parecer consultivo em formato estruturado contendo:
1. **Resumo Preliminar**: De que se trata a controvérsia.
2. **Fundamentação Legal Recomendada**: Quais códigos brasileiras, leis ou jurisprudências sustentam as teses principais (mencione CLT, Código Civil, súmulas, etc., que podem apoiar ou opor-se).
3. **Análise de Riscos e Chances**: Nível de risco estimado (baixo, médio, alto) e quais os pontos fracos e fortes que exigem total atenção jurídica.
4. **Próximos Passos Sugeridos**: Atos práticos para o usuário ou seu patrono executarem (coleta de provas, prazos, audiências, etc.).

Escreva com linguagem profissional de escritório jurídico corporativo, use uma formatação limpa e organizada em Markdown técnico. Adicione o aviso obrigatório de que se trata de inteligência analítica baseada nas informações repassadas.`;

    const aiResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um perito analista jurídico que analisa relatos processuais e gera relatórios consultivos impecáveis em português (pt-BR).",
        temperature: 0.5,
      }
    });

    const analysisText = aiResponse.text || "Não foi possível concluir a análise técnica automatizada para este processo.";
    return res.status(200).json({ analysis: analysisText });

  } catch (err: any) {
    console.error("Erro na análise de processo jurídica:", err);
    return res.status(500).json({
      error: err.message || "Falha técnica na geração da análise processual automatizada."
    });
  }
}
