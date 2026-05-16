import Link from "next/link";
import { Plus, Upload } from "lucide-react";
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/pacotes/importar">
                <Upload className="h-4 w-4" />
                Importar JSON
              </Link>
            </Button>
            <Button size="sm" className="gap-2" asChild>
              <Link href="/pacotes/novo">
                <Plus className="h-4 w-4" />
                Novo pacote
              </Link>
            </Button>
          </div>
        }
      />
      <PacksListClient packs={packs} />
    </>
  );
}
