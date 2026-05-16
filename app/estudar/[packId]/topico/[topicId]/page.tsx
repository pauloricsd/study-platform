import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { getPackById } from "@/lib/data/packs";
import { getTopicsByPack, getExercisesForTopics } from "@/lib/data/topics";
import { saveTopicProgress, saveExerciseResponses } from "@/lib/data/progress";
import { StudyFlow } from "./study-flow";
import { OperationalWidget } from "@/components/operational/operational-widget";

interface Props {
  params: Promise<{ packId: string; topicId: string }>;
}

export default async function TopicStudyPage({ params }: Props) {
  const { packId, topicId } = await params;

  const [profile, pack, topics] = await Promise.all([
    getCurrentProfile(),
    getPackById(packId),
    getTopicsByPack(packId),
  ]);

  if (!pack) notFound();

  const topic = topics.find((t) => t.id === topicId);
  if (!topic) notFound();

  const topicIds = topics.map((t) => t.id);
  const exercises = await getExercisesForTopics(topicIds);

  const studentId = profile?.id ?? "";

  async function onComplete(data: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    responses: { exerciseId: string; userAnswer: string; isCorrect: boolean; wasRevealed: boolean }[];
  }) {
    "use server";
    if (!studentId) return;
    await Promise.all([
      saveTopicProgress({
        studentId,
        topicId,
        score: data.score,
        correctAnswers: data.correctAnswers,
        totalQuestions: data.totalQuestions,
      }),
      saveExerciseResponses(
        data.responses.map((r, i) => ({
          studentId,
          exerciseId: r.exerciseId,
          attemptNumber: i + 1,
          userAnswer: r.userAnswer,
          isCorrect: r.isCorrect,
          wasRevealed: r.wasRevealed,
        }))
      ),
    ]);
  }

  return (
    <>
      <StudyFlow
        topic={topic}
        topics={topics}
        exercises={exercises}
        packId={packId}
        feedbackMode={pack.feedbackMode ?? "immediate"}
        onComplete={onComplete}
      />
      {profile?.isOperational && (
        <OperationalWidget
          userId={profile.id}
          environment={process.env.NODE_ENV ?? "development"}
        />
      )}
    </>
  );
}
