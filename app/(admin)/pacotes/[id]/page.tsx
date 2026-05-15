import { notFound } from "next/navigation";
import { PackHeader } from "@/components/pack/pack-header";
import { PackDetailClient } from "./pack-detail-client";
import { getPackById } from "@/lib/data/packs";
import { getTopicsByPack, getExercisesForTopics } from "@/lib/data/topics";

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

  const topicIds = topics.map((t) => t.id);
  const exercises = await getExercisesForTopics(topicIds);

  return (
    <>
      <PackHeader pack={pack} />
      <div className="flex flex-col flex-1">
        <PackDetailClient pack={pack} topics={topics} exercises={exercises} />
      </div>
    </>
  );
}
