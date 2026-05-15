import { Topbar } from "@/components/layout/topbar";
import { FileText } from "lucide-react";

export default function MateriaisPage() {
  return (
    <>
      <Topbar title="Materiais" />
      <main className="flex flex-1 flex-col items-center justify-center p-12 text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <FileText className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Em breve</p>
          <p className="text-sm text-muted-foreground mt-1">
            A biblioteca de materiais está sendo preparada.
          </p>
        </div>
      </main>
    </>
  );
}
