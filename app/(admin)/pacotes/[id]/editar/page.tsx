import { redirect } from "next/navigation";
import { getPackById } from "@/lib/data/packs";
import { getTopicsByPack, getExercisesForTopics } from "@/lib/data/topics";
import { EditPackClient } from "./edit-pack-client";

interface EditPackPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPackPage({ params }: EditPackPageProps) {
  const { id } = await params;

  const [pack, topics] = await Promise.all([
    getPackById(id),
    getTopicsByPack(id),
  ]);

  if (!pack) redirect("/pacotes");

  const topicIds = topics.map((t) => t.id);
  const exercises = await getExercisesForTopics(topicIds);

  return (
    <EditPackClient pack={pack} topics={topics} exercises={exercises} />
  );
}
