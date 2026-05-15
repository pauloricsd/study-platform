import { notFound } from "next/navigation";
import { PackHeader } from "@/components/pack/pack-header";
import { PackDetailClient } from "./pack-detail-client";
import { mockStudyPacks } from "@/lib/mock-data";
import { mockTopics, mockExercises } from "@/lib/mock-topics";

interface PackPageProps {
  params: Promise<{ id: string }>;
}

export default async function PackPage({ params }: PackPageProps) {
  const { id } = await params;
  const pack = mockStudyPacks.find((p) => p.id === id);
  if (!pack) notFound();

  const topics = mockTopics.filter((t) => t.packId === id);
  const topicIds = topics.map((t) => t.id);
  const exercises = mockExercises.filter((e) => topicIds.includes(e.topicId));

  return (
    <>
      <PackHeader pack={pack} />
      <div className="flex flex-col flex-1">
        <PackDetailClient pack={pack} topics={topics} exercises={exercises} />
      </div>
    </>
  );
}
