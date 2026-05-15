export type TopicStatus = "completed" | "review" | "not_started";

export interface TopicHistory {
  topicId: string;
  packId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  attempts: number;
  lastAttemptAt: string | null;
}

export const mockTopicHistory: TopicHistory[] = [
  {
    topicId: "t1",
    packId: "p1",
    score: 100,
    correctAnswers: 3,
    totalQuestions: 3,
    attempts: 1,
    lastAttemptAt: "2026-05-13T19:45:00Z",
  },
  {
    topicId: "t2",
    packId: "p1",
    score: 50,
    correctAnswers: 1,
    totalQuestions: 2,
    attempts: 2,
    lastAttemptAt: "2026-05-12T20:00:00Z",
  },
  {
    topicId: "t3",
    packId: "p1",
    score: 67,
    correctAnswers: 2,
    totalQuestions: 3,
    attempts: 1,
    lastAttemptAt: "2026-05-11T18:30:00Z",
  },
  {
    topicId: "t4",
    packId: "p1",
    score: 0,
    correctAnswers: 0,
    totalQuestions: 2,
    attempts: 0,
    lastAttemptAt: null,
  },
  {
    topicId: "t5",
    packId: "p1",
    score: 0,
    correctAnswers: 0,
    totalQuestions: 2,
    attempts: 0,
    lastAttemptAt: null,
  },
];

export function getTopicStatus(history: TopicHistory): TopicStatus {
  if (history.attempts === 0) return "not_started";
  if (history.score >= 80) return "completed";
  return "review";
}
