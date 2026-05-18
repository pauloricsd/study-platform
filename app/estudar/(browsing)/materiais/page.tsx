import { Topbar } from "@/components/layout/topbar";
import { getCurrentProfile } from "@/lib/data/auth";
import { getStudentPacks } from "@/lib/data/packs";
import { MateriaisClient } from "./materiais-client";

export default async function MateriaisPage() {
  const profile = await getCurrentProfile();
  const packs = profile ? await getStudentPacks(profile.id) : [];

  return (
    <>
      <Topbar title="Meus Materiais" />
      <main className="mx-auto max-w-5xl px-4 lg:px-8 py-6">
        <MateriaisClient packs={packs} />
      </main>
    </>
  );
}
