import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/topbar";
import { getPacks } from "@/lib/data/packs";
import { PacksListClient } from "./packs-list-client";

export default async function PacksPage() {
  const packs = await getPacks();
  return (
    <>
      <Topbar
        title="Pacotes de Estudo"
        action={
          <Button size="sm" className="gap-2" asChild>
            <Link href="/pacotes/novo">
              <Plus className="h-4 w-4" />
              Novo pacote
            </Link>
          </Button>
        }
      />
      <PacksListClient packs={packs} />
    </>
  );
}
