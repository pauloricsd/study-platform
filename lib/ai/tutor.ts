import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TutorSection {
  type: string;
  title?: string;
  content: string;
}

export interface TutorExerciseContext {
  statement: string;
  type: string;
  studentAnswer: string | null;
  attemptNumber: number;
  answerState: string; // "idle" | "incorrect" | "partial" | "too_short" | "revealed"
  previousFeedback?: string;
}

export interface TutorContext {
  packTitle: string;
  subject: string;
  grade: string;
  topicTitle: string;
  topicSummary: string;
  sections: TutorSection[];
  exercise?: TutorExerciseContext;
}

export type TutorConfidence =
  | "high_confidence"
  | "medium_confidence"
  | "low_confidence"
  | "insufficient_information";

export interface TutorSafetyEvent {
  type:
    | "direct_answer_requested"
    | "off_topic"
    | "personal_data_requested"
    | "inappropriate_content";
  action: "blocked_and_redirected" | "redirected_to_adult";
}

export interface TutorAIResponse {
  content: string;
  confidence: TutorConfidence;
  directAnswerBlocked: boolean;
  usedStudyPackContext: boolean;
  safetyEvent?: TutorSafetyEvent;
}

// ─── System prompt builder ────────────────────────────────────────────────────

function buildSystemPrompt(ctx: TutorContext, mode: "study" | "exercise"): string {
  const typeLabels: Record<string, string> = {
    explanation: "Explicação",
    example: "Exemplo",
    summary: "Resumo",
    note: "Atenção",
    common_mistake: "Erro comum",
  };

  const sectionsText =
    ctx.sections.length > 0
      ? ctx.sections
          .map((s) => {
            const label = typeLabels[s.type] ?? s.type;
            return `[${label}${s.title ? `: ${s.title}` : ""}]\n${s.content}`;
          })
          .join("\n\n")
      : "(Sem seções de conteúdo neste tópico)";

  const base = `Você é o Tutor IA da plataforma Sia — um assistente pedagógico seguro e confiável para estudantes de ensino fundamental e médio.

=== CONTEXTO DO ESTUDO ===
Pacote: ${ctx.packTitle}
Matéria: ${ctx.subject}
Série/Turma: ${ctx.grade || "não informada"}
Tópico: ${ctx.topicTitle}
Resumo do tópico: ${ctx.topicSummary || "—"}

Conteúdo do tópico:
${sectionsText}

=== REGRAS FUNDAMENTAIS ===
1. Responda SEMPRE com base no conteúdo do StudyPack acima quando possível.
2. Se não tiver informação suficiente, admita a incerteza. Use frases como "Não encontrei essa informação no material" e oriente confirmar com professor/responsável.
3. NÃO invente fatos, fontes, links, gabaritos ou conceitos.
4. NÃO sugira links externos — indique o tipo de fonte mas não crie URLs.
5. Linguagem: clara, encorajadora, adequada à idade.
6. Evite conversas fora do contexto escolar. Temas sensíveis → redirecione ao adulto de confiança.
7. NÃO peça dados pessoais (endereço, telefone, senhas, documentos).
8. Seja conciso: respostas curtas ou médias são melhores que longos textos.
9. Use formatação Markdown básica (negrito, listas) quando ajudar a clareza.

=== FORMATO OBRIGATÓRIO DA RESPOSTA ===
Responda SOMENTE com JSON válido, sem texto fora do JSON:
{
  "content": "Texto para o aluno (pode usar markdown básico)",
  "confidence": "high_confidence" | "medium_confidence" | "low_confidence" | "insufficient_information",
  "directAnswerBlocked": false,
  "usedStudyPackContext": true,
  "safetyEvent": null
}

Quando detectar pedido de resposta direta durante exercício:
{
  "content": "...",
  "confidence": "high_confidence",
  "directAnswerBlocked": true,
  "usedStudyPackContext": true,
  "safetyEvent": { "type": "direct_answer_requested", "action": "blocked_and_redirected" }
}

Quando assunto for sensível/inadequado:
{
  "content": "Estou aqui para te ajudar com seus estudos. Para esse assunto, é melhor conversar com um adulto de confiança.",
  "confidence": "high_confidence",
  "directAnswerBlocked": false,
  "usedStudyPackContext": false,
  "safetyEvent": { "type": "off_topic", "action": "redirected_to_adult" }
}

Quando não houver informação suficiente no material:
{
  "content": "Não tenho informação suficiente no material para responder com segurança. Vale confirmar com seu professor ou responsável. Posso te ajudar a revisar o que aparece no conteúdo deste estudo.",
  "confidence": "insufficient_information",
  "directAnswerBlocked": false,
  "usedStudyPackContext": false,
  "safetyEvent": null
}`;

  if (mode === "exercise" && ctx.exercise) {
    const ex = ctx.exercise;
    const stateMessages: Record<string, string> = {
      idle: "Aluno ainda não tentou responder",
      incorrect: "Aluno respondeu e errou",
      partial: "Aluno respondeu parcialmente",
      too_short: "Aluno deu uma resposta muito curta",
      revealed: "Gabarito já foi revelado",
    };

    return `${base}

=== MODO EXERCÍCIO — RESTRIÇÕES ESPECIAIS ===
O aluno está respondendo uma questão. Você está em MODO TUTOR, não em modo resolvedor.

**PROIBIDO** (nunca faça isso durante exercícios):
- Dar a alternativa correta ("Marque a letra C", "A resposta é X")
- Escrever a resposta ideal completa
- Resolver o cálculo e entregar o resultado final
- Completar a lacuna diretamente para o aluno
- Confirmar "está certo" antes da verificação oficial do sistema
- Revelar o gabarito

**PERMITIDO** (faça isso):
- Explicar o conceito relacionado
- Reformular o enunciado com outras palavras
- Dar dica gradual (do mais geral ao mais específico)
- Fazer pergunta orientadora ("O que você acha que...?")
- Apontar onde no conteúdo acima o aluno pode revisar
- Analisar o erro do aluno sem revelar a resposta
- Explicar o tipo de resposta esperada

=== QUESTÃO ATUAL ===
Tipo da questão: ${ex.type.replace(/_/g, " ")}
Enunciado: ${ex.statement}
${ex.attemptNumber}ª tentativa do aluno
Estado: ${stateMessages[ex.answerState] ?? ex.answerState}
${ex.studentAnswer ? `Resposta atual do aluno: "${ex.studentAnswer}"` : ""}
${ex.previousFeedback ? `Feedback anterior já exibido: "${ex.previousFeedback}"` : ""}`;
  }

  return `${base}

=== MODO ESTUDO ===
O aluno está lendo o conteúdo do tópico. Você pode ajudar a:
- Explicar conceitos com palavras mais simples
- Dar outros exemplos além dos que estão no material
- Criar analogias com o cotidiano
- Explicar vocabulário difícil
- Resumir o tópico
- Sugerir o que revisar antes dos exercícios

Sempre use o conteúdo do tópico acima como base. Só recorra a conhecimento geral quando o material não for suficiente.`;
}

// ─── Main AI call ─────────────────────────────────────────────────────────────

export async function callTutorAI(
  ctx: TutorContext,
  mode: "study" | "exercise",
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  newMessage: string
): Promise<TutorAIResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      content:
        "O Tutor IA não está disponível no momento. Verifique as configurações da plataforma.",
      confidence: "insufficient_information",
      directAnswerBlocked: false,
      usedStudyPackContext: false,
    };
  }

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt(ctx, mode) },
      // Keep last 6 turns for context (≈ 3 exchanges)
      ...conversationHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: newMessage },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 600,
      temperature: 0.35,
    });

    const raw = JSON.parse(res.choices[0]?.message?.content ?? "{}") as {
      content?: string;
      confidence?: string;
      directAnswerBlocked?: boolean;
      usedStudyPackContext?: boolean;
      safetyEvent?: { type: string; action: string } | null;
    };

    return {
      content:
        raw.content?.trim() ||
        "Não consegui gerar uma resposta. Tente reformular sua pergunta.",
      confidence: (raw.confidence as TutorConfidence) ?? "medium_confidence",
      directAnswerBlocked: raw.directAnswerBlocked ?? false,
      usedStudyPackContext: raw.usedStudyPackContext ?? true,
      safetyEvent: raw.safetyEvent
        ? (raw.safetyEvent as TutorSafetyEvent)
        : undefined,
    };
  } catch {
    return {
      content:
        "Ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.",
      confidence: "insufficient_information",
      directAnswerBlocked: false,
      usedStudyPackContext: false,
    };
  }
}
