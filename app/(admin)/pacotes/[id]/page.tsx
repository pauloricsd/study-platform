import { notFound } from "next/navigation";
import { PackHeader } from "@/components/pack/pack-header";
import { PackDetailClient } from "./pack-detail-client";
import { getPackById } from "@/lib/data/packs";
import { getTopicsByPack, getExercisesForTopics } from "@/lib/data/topics";
import { getPackReport } from "@/lib/data/reports";
import { getSuggestedQuestionsForPack } from "@/lib/data/suggestions";

interface PackPageProps {
  params: Promise<{ id: string }>;
}

export default async function PackPage({ params }: PackPageProps) {
  const { id } = await params;

  const [pack, topics] = await Promise.all([
    getPackById(id),
    getTopicsByPack(id),
  ]);

  if (!pack) notFound();

  const topicSummaries = topics.map((t) => ({ id: t.id, title: t.title }));
  const topicIds = topicSummaries.map((t) => t.id);

  const [exercises, report, suggestedQuestions] = await Promise.all([
    getExercisesForTopics(topicIds),
    getPackReport(id, topicSummaries),
    getSuggestedQuestionsForPack(id),
  ]);

  return (
    <>
      <PackHeader pack={pack} />
      <div className="flex flex-col flex-1">
        <PackDetailClient
          pack={pack}
          topics={topics}
          exercises={exercises}
          report={report}
          suggestedQuestions={suggestedQuestions}
        />
      </div>
    </>
  );
}
