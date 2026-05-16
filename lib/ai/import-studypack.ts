/**
 * import-studypack.ts
 * Pure TypeScript module (no AI, no Supabase) for parsing and validating StudyPack JSON files.
 */

import type { Database } from "@/lib/database.types";

// ─── StudyPack Format Types ───────────────────────────────────────────────────

export interface StudyPackOption {
  id: string;
  text: string;
}

export interface StudyPackAnswerKey {
  // multiple_choice
  correctOptionId?: string;
  // true_false / numeric
  correctValue?: boolean | number;
  // fill_blank
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
  ignoreAccents?: boolean;
  // open_short
  idealAnswer?: string;
  // numeric
  tolerance?: number;
  unit?: string;
  unitRequired?: boolean;
}

export interface StudyPackQuestion {
  id: string;
  type: string;
  topicId: string;
  prompt: string;
  options?: StudyPackOption[];
  answerKey: StudyPackAnswerKey;
  explanation: string;
  difficulty?: string;
  title?: string;
  hint?: string;
  points?: number;
  tags?: string[];
}

export interface StudyPackTopic {
  id: string;
  title: string;
  summary: string;
  order?: number;
  keyConcepts?: string[];
  commonMistakes?: string[];
}

export interface StudyPackMetadata {
  title: string;
  subject: string;
  schoolLevel: string;
  description?: string;
  examDate?: string;
  createdBy?: string;
  language?: string;
  studentAge?: number;
  tags?: string[];
  source?: string;
}

export interface StudyPackFile {
  studyPackVersion: string;
  metadata: StudyPackMetadata;
  topics: StudyPackTopic[];
  questions: StudyPackQuestion[];
  settings?: Record<string, unknown>;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

const SUPPORTED_TYPES = new Set([
  "multiple_choice",
  "true_false",
  "fill_blank",
  "open_short",
  "numeric",
]);

export function validateStudyPack(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    errors.push("O arquivo não é um objeto JSON válido.");
    return { errors, warnings };
  }

  const obj = data as Record<string, unknown>;

  // studyPackVersion
  if (!obj.studyPackVersion) {
    errors.push('Campo obrigatório ausente: "studyPackVersion".');
  }

  // metadata
  if (typeof obj.metadata !== "object" || obj.metadata === null) {
    errors.push('Campo obrigatório ausente: "metadata".');
  } else {
    const meta = obj.metadata as Record<string, unknown>;
    if (!meta.title || typeof meta.title !== "string" || !meta.title.trim()) {
      errors.push('"metadata.title" é obrigatório e não pode estar vazio.');
    }
    if (!meta.subject || typeof meta.subject !== "string" || !meta.subject.trim()) {
      errors.push('"metadata.subject" é obrigatório e não pode estar vazio.');
    }
    if (!meta.schoolLevel || typeof meta.schoolLevel !== "string" || !meta.schoolLevel.trim()) {
      errors.push('"metadata.schoolLevel" é obrigatório e não pode estar vazio.');
    }
  }

  // topics
  if (!Array.isArray(obj.topics)) {
    errors.push('Campo obrigatório ausente: "topics" (deve ser um array).');
  } else if (obj.topics.length === 0) {
    errors.push('"topics" não pode ser um array vazio. Inclua pelo menos um tópico.');
  }

  // questions
  if (!Array.isArray(obj.questions)) {
    errors.push('Campo obrigatório ausente: "questions" (deve ser um array).');
  } else if (obj.questions.length === 0) {
    errors.push('"questions" não pode ser um array vazio. Inclua pelo menos uma questão.');
  }

  // If structural errors so far, bail early
  if (errors.length > 0) return { errors, warnings };

  const topics = obj.topics as unknown[];
  const questions = obj.questions as unknown[];

  // Validate topics and collect IDs
  const topicIds = new Set<string>();
  const seenTopicIds = new Set<string>();

  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    if (typeof t !== "object" || t === null) {
      errors.push(`Tópico na posição ${i} não é um objeto válido.`);
      continue;
    }
    const topic = t as Record<string, unknown>;

    if (!topic.id || typeof topic.id !== "string" || !topic.id.trim()) {
      errors.push(`Tópico na posição ${i} está sem "id".`);
      continue;
    }

    const tid = topic.id as string;
    if (seenTopicIds.has(tid)) {
      errors.push(`ID de tópico duplicado: "${tid}".`);
    } else {
      seenTopicIds.add(tid);
      topicIds.add(tid);
    }

    if (!topic.title || typeof topic.title !== "string" || !topic.title.trim()) {
      errors.push(`Tópico "${tid}" está sem "title".`);
    }
    if (!topic.summary || typeof topic.summary !== "string" || !topic.summary.trim()) {
      errors.push(`Tópico "${tid}" está sem "summary".`);
    }
  }

  // Validate questions
  const seenQuestionIds = new Set<string>();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (typeof q !== "object" || q === null) {
      errors.push(`Questão na posição ${i} não é um objeto válido.`);
      continue;
    }
    const question = q as Record<string, unknown>;
    const qLabel = question.id ? `"${question.id}"` : `posição ${i}`;

    // id
    if (!question.id || typeof question.id !== "string" || !question.id.trim()) {
      errors.push(`Questão na posição ${i} está sem "id".`);
    } else {
      if (seenQuestionIds.has(question.id as string)) {
        errors.push(`ID de questão duplicado: "${question.id}".`);
      } else {
        seenQuestionIds.add(question.id as string);
      }
    }

    // type
    if (!question.type || typeof question.type !== "string") {
      errors.push(`Questão ${qLabel} está sem "type".`);
    } else if (!SUPPORTED_TYPES.has(question.type as string)) {
      errors.push(
        `Questão ${qLabel} tem tipo não suportado: "${question.type}". Tipos suportados: ${[...SUPPORTED_TYPES].join(", ")}.`
      );
    }

    // topicId
    if (!question.topicId || typeof question.topicId !== "string") {
      errors.push(`Questão ${qLabel} está sem "topicId".`);
    } else if (!topicIds.has(question.topicId as string)) {
      errors.push(
        `Questão ${qLabel} referencia tópico inexistente: "${question.topicId}".`
      );
    }

    // prompt
    if (!question.prompt || typeof question.prompt !== "string" || !question.prompt.trim()) {
      errors.push(`Questão ${qLabel} está sem "prompt".`);
    }

    // explanation
    if (!question.explanation || typeof question.explanation !== "string" || !question.explanation.trim()) {
      errors.push(`Questão ${qLabel} está sem "explanation".`);
    }

    // answerKey
    if (typeof question.answerKey !== "object" || question.answerKey === null) {
      errors.push(`Questão ${qLabel} está sem "answerKey".`);
    } else {
      const ak = question.answerKey as Record<string, unknown>;
      const qtype = question.type as string;

      if (qtype === "multiple_choice") {
        if (!Array.isArray(question.options) || question.options.length === 0) {
          errors.push(`Questão ${qLabel} (multiple_choice) está sem "options".`);
        }
        if (!ak.correctOptionId || typeof ak.correctOptionId !== "string") {
          errors.push(`Questão ${qLabel} (multiple_choice) está sem "answerKey.correctOptionId".`);
        } else if (Array.isArray(question.options)) {
          const optionIds = (question.options as Array<Record<string, unknown>>).map(
            (o) => o.id
          );
          if (!optionIds.includes(ak.correctOptionId)) {
            errors.push(
              `Questão ${qLabel}: "answerKey.correctOptionId" ("${ak.correctOptionId}") não corresponde a nenhuma opção.`
            );
          }
        }
      } else if (qtype === "true_false") {
        if (ak.correctValue === undefined || ak.correctValue === null) {
          errors.push(`Questão ${qLabel} (true_false) está sem "answerKey.correctValue".`);
        } else if (typeof ak.correctValue !== "boolean") {
          errors.push(
            `Questão ${qLabel} (true_false): "answerKey.correctValue" deve ser um booleano (true ou false).`
          );
        }
      } else if (qtype === "fill_blank") {
        if (!Array.isArray(ak.acceptedAnswers) || ak.acceptedAnswers.length === 0) {
          errors.push(
            `Questão ${qLabel} (fill_blank) está sem "answerKey.acceptedAnswers" ou o array está vazio.`
          );
        }
      } else if (qtype === "open_short") {
        if (!ak.idealAnswer || typeof ak.idealAnswer !== "string" || !(ak.idealAnswer as string).trim()) {
          errors.push(`Questão ${qLabel} (open_short) está sem "answerKey.idealAnswer".`);
        }
        // Warning: open_short without acceptanceCriteria
        if (!question.acceptanceCriteria) {
          warnings.push(
            `Questão ${qLabel} (open_short) não tem "acceptanceCriteria". A correção automática pode ser menos precisa.`
          );
        }
      } else if (qtype === "numeric") {
        if (ak.correctValue === undefined || ak.correctValue === null) {
          errors.push(`Questão ${qLabel} (numeric) está sem "answerKey.correctValue".`);
        } else if (typeof ak.correctValue !== "number") {
          errors.push(
            `Questão ${qLabel} (numeric): "answerKey.correctValue" deve ser um número.`
          );
        }
      }
    }
  }

  return { errors, warnings };
}

// ─── DB Row Types ─────────────────────────────────────────────────────────────

type TopicInsert = Database["public"]["Tables"]["topics"]["Insert"];
type ExerciseInsert = Database["public"]["Tables"]["exercises"]["Insert"];

export interface DbRows {
  topics: TopicInsert[];
  exercises: ExerciseInsert[];
}

// Maps option id (a,b,c,d) to uppercase label (A,B,C,D)
function optionIdToLabel(id: string): string {
  return id.toUpperCase();
}

function mapCorrectAnswer(question: StudyPackQuestion): string {
  const ak = question.answerKey;

  switch (question.type) {
    case "multiple_choice": {
      const id = ak.correctOptionId ?? "";
      return optionIdToLabel(id);
    }
    case "true_false": {
      return ak.correctValue === true ? "Verdadeiro" : "Falso";
    }
    case "fill_blank": {
      return ak.acceptedAnswers?.[0] ?? "";
    }
    case "open_short": {
      return ak.idealAnswer ?? "";
    }
    case "numeric": {
      return String(ak.correctValue ?? "");
    }
    default:
      return "";
  }
}

function mapChoices(question: StudyPackQuestion): Database["public"]["Tables"]["exercises"]["Insert"]["choices"] {
  if (question.type !== "multiple_choice" || !Array.isArray(question.options)) {
    return null;
  }

  const labels = ["A", "B", "C", "D", "E", "F"];
  return question.options.map((opt, idx) => ({
    id: opt.id,
    label: labels[idx] ?? optionIdToLabel(opt.id),
    text: opt.text,
  }));
}

/**
 * Maps a validated StudyPackFile to arrays of DB insert rows.
 * Topics are returned in their declared order.
 * Exercises are grouped by topic, in the order they appear in questions[].
 *
 * NOTE: The returned topics do NOT have pack_id set — caller must set it.
 * The returned exercises do NOT have topic_id set — caller must resolve it
 * using the topicSourceId field attached to each exercise.
 */
export interface MappedTopic extends TopicInsert {
  /** Original topic ID from the StudyPack file, used to match exercises */
  _sourceId: string;
}

export interface MappedExercise extends ExerciseInsert {
  /** Original topicId from the StudyPack file, used to resolve DB topic_id */
  _sourceTopicId: string;
}

export interface MappedRows {
  topics: MappedTopic[];
  exercises: MappedExercise[];
}

export function mapToDbRows(file: StudyPackFile, packId: string): MappedRows {
  // Build topics in order (use declared order field if present, else array index)
  const sortedTopics = [...file.topics].sort((a, b) => {
    const oa = a.order ?? 0;
    const ob = b.order ?? 0;
    return oa - ob;
  });

  const topics: MappedTopic[] = sortedTopics.map((t, idx) => ({
    _sourceId: t.id,
    pack_id: packId,
    title: t.title,
    summary: t.summary,
    order: idx,
  }));

  // Map questions → exercises, grouped by topicId order
  const exercises: MappedExercise[] = [];
  // Track per-topic order counter
  const topicOrderMap = new Map<string, number>();

  // Process questions in file order
  for (const q of file.questions) {
    const currentOrder = topicOrderMap.get(q.topicId) ?? 0;
    topicOrderMap.set(q.topicId, currentOrder + 1);

    const exercise: MappedExercise = {
      _sourceTopicId: q.topicId,
      topic_id: "", // will be resolved by the server action
      type: q.type as ExerciseInsert["type"],
      statement: q.prompt,
      choices: mapChoices(q),
      correct_answer: mapCorrectAnswer(q),
      explanation: q.explanation,
      order: currentOrder,
    };

    exercises.push(exercise);
  }

  return { topics, exercises };
}
