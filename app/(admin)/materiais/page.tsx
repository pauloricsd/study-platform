import { Topbar } from "@/components/layout/topbar";
import { getSourceFiles, getAllExercises } from "@/lib/data/materiais";
import { MateriaisClient } from "./materiais-client";

export default async function MateriaisPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const initialTab = params.tab === "questoes" ? "questoes" : "arquivos";

  const [sourceFiles, exercises] = await Promise.all([
    getSourceFiles(),
    getAllExercises(),
  ]);

  return (
    <>
      <Topbar title="Materiais" />
      <MateriaisClient
        initialTab={initialTab}
        sourceFiles={sourceFiles}
        exercises={exercises}
      />
    </>
  );
}
