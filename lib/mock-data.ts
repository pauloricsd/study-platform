export type StudyPackStatus = "draft" | "in_review" | "published" | "archived";

export type Subject =
  | "Português"
  | "Matemática"
  | "Ciências"
  | "História"
  | "Geografia"
  | "Inglês"
  | "Biologia"
  | "Física"
  | "Química";

export interface Student {
  id: string;
  name: string;
  grade: string;
  avatarInitials: string;
  color: string;
}

export interface StudyPackProgress {
  topicsTotal: number;
  topicsDone: number;
  questionsTotal: number;
  questionsAnswered: number;
  correctAnswers: number;
  lastAccessedAt: string | null;
}

export interface StudyPack {
  id: string;
  title: string;
  subject: Subject;
  grade: string;
  examName: string;
  examDate: string;
  status: StudyPackStatus;
  topicsCount: number;
  questionsCount: number;
  feedbackMode?: "immediate" | "adaptive";
  studentIds: string[];
  createdAt: string;
  updatedAt: string;
  progress?: StudyPackProgress;
}

export const mockStudents: Student[] = [
  { id: "s1", name: "Ana Luiza", grade: "7º ano", avatarInitials: "AL", color: "bg-violet-100 text-violet-700" },
  { id: "s2", name: "Pedro Henrique", grade: "8º ano", avatarInitials: "PH", color: "bg-sky-100 text-sky-700" },
  { id: "s3", name: "Sofia", grade: "6º ano", avatarInitials: "SO", color: "bg-pink-100 text-pink-700" },
];

export const mockStudyPacks: StudyPack[] = [
  {
    id: "p1",
    title: "Gramática: Classes de Palavras",
    subject: "Português",
    grade: "7º ano",
    examName: "Prova Bimestral — 2º Bimestre",
    examDate: "2026-05-28",
    status: "published",
    topicsCount: 5,
    questionsCount: 20,
    studentIds: ["s1"],
    createdAt: "2026-05-01T10:00:00Z",
    updatedAt: "2026-05-10T14:30:00Z",
    progress: {
      topicsTotal: 5,
      topicsDone: 3,
      questionsTotal: 20,
      questionsAnswered: 14,
      correctAnswers: 11,
      lastAccessedAt: "2026-05-13T19:45:00Z",
    },
  },
  {
    id: "p2",
    title: "Equações do 1º Grau",
    subject: "Matemática",
    grade: "7º ano",
    examName: "Avaliação Mensal — Maio",
    examDate: "2026-05-22",
    status: "published",
    topicsCount: 4,
    questionsCount: 15,
    studentIds: ["s1", "s2"],
    createdAt: "2026-05-05T09:00:00Z",
    updatedAt: "2026-05-09T11:00:00Z",
    progress: {
      topicsTotal: 4,
      topicsDone: 1,
      questionsTotal: 15,
      questionsAnswered: 4,
      correctAnswers: 2,
      lastAccessedAt: "2026-05-12T20:10:00Z",
    },
  },
  {
    id: "p3",
    title: "Sistema Solar e Movimentos da Terra",
    subject: "Ciências",
    grade: "6º ano",
    examName: "Prova de Ciências — Junho",
    examDate: "2026-06-10",
    status: "in_review",
    topicsCount: 6,
    questionsCount: 18,
    studentIds: ["s3"],
    createdAt: "2026-05-12T15:00:00Z",
    updatedAt: "2026-05-13T16:00:00Z",
  },
  {
    id: "p4",
    title: "Revolução Industrial",
    subject: "História",
    grade: "8º ano",
    examName: "Simulado — 2º Bimestre",
    examDate: "2026-06-03",
    status: "draft",
    topicsCount: 3,
    questionsCount: 0,
    studentIds: ["s2"],
    createdAt: "2026-05-13T10:00:00Z",
    updatedAt: "2026-05-13T10:00:00Z",
  },
  {
    id: "p5",
    title: "Interpretação de Texto",
    subject: "Português",
    grade: "8º ano",
    examName: "Redação e Interpretação — Maio",
    examDate: "2026-05-30",
    status: "published",
    topicsCount: 4,
    questionsCount: 12,
    studentIds: ["s2"],
    createdAt: "2026-04-28T08:00:00Z",
    updatedAt: "2026-05-08T09:00:00Z",
    progress: {
      topicsTotal: 4,
      topicsDone: 4,
      questionsTotal: 12,
      questionsAnswered: 12,
      correctAnswers: 10,
      lastAccessedAt: "2026-05-11T18:30:00Z",
    },
  },
];

export const subjectColors: Record<Subject, string> = {
  Português: "bg-violet-50 text-violet-700 border-violet-200",
  Matemática: "bg-blue-50 text-blue-700 border-blue-200",
  Ciências: "bg-emerald-50 text-emerald-700 border-emerald-200",
  História: "bg-amber-50 text-amber-700 border-amber-200",
  Geografia: "bg-teal-50 text-teal-700 border-teal-200",
  Inglês: "bg-sky-50 text-sky-700 border-sky-200",
  Biologia: "bg-green-50 text-green-700 border-green-200",
  Física: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Química: "bg-orange-50 text-orange-700 border-orange-200",
};

export const statusLabels: Record<StudyPackStatus, string> = {
  draft: "Rascunho",
  in_review: "Em revisão",
  published: "Publicado",
  archived: "Arquivado",
};

export function getDaysUntilExam(examDate: string | null | undefined): number | null {
  if (!examDate) return null;
  const today = new Date();
  const exam = new Date(examDate);
  if (isNaN(exam.getTime())) return null;
  const diff = exam.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getCompletionRate(progress?: StudyPackProgress): number {
  if (!progress || progress.questionsTotal === 0) return 0;
  return Math.round((progress.questionsAnswered / progress.questionsTotal) * 100);
}

export function getAccuracyRate(progress?: StudyPackProgress): number {
  if (!progress || progress.questionsAnswered === 0) return 0;
  return Math.round((progress.correctAnswers / progress.questionsAnswered) * 100);
}
