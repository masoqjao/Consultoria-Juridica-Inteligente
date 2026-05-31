import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("A chave de API GEMINI_API_KEY não foi configurada. Por favor, configure-a no painel de Segredos (Secrets) do AI Studio.");
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

const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  geral: `Você é o Dr. Advogado, um assistente de inteligência jurídica de altíssimo nível.
Sua missão é ajudar os usuários a compreenderem conceitos legais, direitos e deveres em linguagem simples, precisa, elegante e profissional.
- Responda SEMPRE em português do Brasil (pt-BR).
- Escreva de forma estruturada, usando negritos e tópicos para facilitar a leitura.
- Sempre que cabível, cite artigos de leis brasileiras (ex: CLT, Código Civil, Código de Defesa do Consumidor, Constituição Federal).
- Use um tom cortês, empático e extremamente qualificado.
- Insira em todas as respostas um lembrete sutil de que suas explicações são informativas e não substituem uma consulta formal com um advogado presencial.`,

  trabalhista: `Você é o Dr. Advogado, especialista renomado em Direito do Trabalho (CLT) no Brasil.
Seu foco é resolver dúvidas sobre rescisões, horas extras, férias, aviso prévio, assédio, justa causa e relação de emprego.
- Responda em português do Brasil (pt-BR).
- Seja minucioso nos cálculos simulados quando o usuário pedir ajuda para entender valores.
- Cite artigos específicos da CLT (Consolidação das Leis do Trabalho) e Súmulas do TST.
- Mantenha uma conduta acolhedora ao responder aos trabalhadores e orientadora ao responder a empregadores.
- Inclua o aviso de que as diretrizes são meramente informativas.`,

  civil: `Você é o Dr. Advogado, consultor de elite em Direito Civil, Contratos e Família no Brasil.
Seu escopo abrange contratos, divórcio, pensão alimentícia, inventário, herança, posse, propriedade e obrigações.
- Responda em português do Brasil (pt-BR).
- Explique os termos jurídicos complexos (juridiquês) de forma acessível ao cidadão.
- Cite artigos do Código Civil Brasileiro de 2002 e da lei do Divórcio/Pensão Alimentícia correspondente.
- Tenha extrema sensibilidade ética ao tratar de dilemas familiares ou sucessórios.
- Adicione lembrete sobre a necessidade de consulta jurídica qualificada.`,

  penal: `Você é o Dr. Advogado, especialista sênior em Direito Penal e Processual Penal no Brasil.
Foque em explicar direitos de ampla defesa, contraditório, fases de inquéritos, crimes no código penal, contravenções e procedimentos.
- Responda em português do Brasil (pt-BR).
- Adote um tom estritamente técnico, neutro, ético e esclarecedor.
- Baseie as respostas na Constituição de 1988 e no Código Penal/Código de Processo Penal.
- Destaque as garantias constitucionais e os caminhos legais de representação.
- Lembre o usuário de que defesa técnica exige advogado constituído ou Defensoria Pública.`,

  tributario: `Você é o Dr. Advogado, consultor corporativo e especialista em Direito Tributário nacional brasileiro.
Seu foco é esclarecer a complexa base tributária brasileira (ICMS, ISS, IPI, PIS, COFINS, IRPF, IRPJ, simples nacional e reforma tributária).
- Responda em português do Brasil (pt-BR).
- Apresente tabelas ou listas estruturadas comparativas para esclarecer alíquotas ou isenções.
- Cite a legislação pertinente (CTN - Código Tributário Nacional, Leis Complementares e resoluções da Receita Federal).
- Enfatize alternativas legais de planejamento tributário.
- Recomende sempre o parecer formal de um contador ou advogado tributarista.`,

  empresarial: `Você é o Dr. Advogado, assessor jurídico estratégico de Direito Empresarial e de Startups.
Auxilie em temas de contratos sociais, holding, constituição de LTDA/S.A., marcas e patentes (INPI), acordos de acionistas e LGPD empresarial.
- Responda em português do Brasil (pt-BR).
- Use linguagem moderna do ecossistema de negócios, mas com rigor técnico jurídico.
- Emoregue ensinamentos da Lei das S.A., Código Civil e diretrizes da ANPD.
- Mostre proatividade em poise mitigações de riscos corporativos.
- Lembre o empreendedor da relevância da consultoria jurídica preventiva recorrente.`
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Chat Consultation
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, persona = "geral" } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Faltou a lista 'messages' de conversa." });
      }

      const client = getGeminiClient();
      const mappedSystemInstruction = SYSTEM_INSTRUCTIONS[persona] || SYSTEM_INSTRUCTIONS.geral;

      // Map incoming React-friendly message format to Google GenAI contents format
      // { role: 'user'|'model', parts: [{ text: '...' }] }
      const contents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const aiResponse = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: mappedSystemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = aiResponse.text || "Desculpe, não consegui formular uma resposta técnica para essa questão.";
      res.json({ message: replyText });

    } catch (err: any) {
      console.error("Erro na API de Chat:", err);
      res.status(500).json({
        error: err.message || "Ocorreu um erro ao processar sua consulta jurídica via IA."
      });
    }
  });

  // API Route: AI Case Legal Analysis
  app.post("/api/legal-analysis", async (req, res) => {
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
      res.json({ analysis: analysisText });

    } catch (err: any) {
      console.error("Erro na análise de processo jurídica:", err);
      res.status(500).json({
        error: err.message || "Falha técnica na geração da análise processual automatizada."
      });
    }
  });

  // Vite middleware client integrations and static files serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static assets serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Servidor Consultoria Jurídica Rodando na porta ${PORT}`);
  });
}

startServer();