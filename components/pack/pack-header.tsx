import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { type StudyPack, subjectColors, statusLabels, getDaysUntilExam } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { PackActions } from "@/app/(admin)/pacotes/[id]/pack-actions";

interface PackHeaderProps {
  pack: StudyPack;
}

const statusVariant: Record<string, "success" | "warning" | "draft" | "review" | "secondary"> = {
  published: "success",
  in_review: "review",
  draft: "draft",
  archived: "secondary",
};

export function PackHeader({ pack }: PackHeaderProps) {
  const daysUntil = getDaysUntilExam(pack.examDate);
  const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil > 0;

  return (
    <div className="border-b bg-white">
      {/* Breadcrumb */}
      <div className="px-6 pt-4 pb-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar ao início
        </Link>
      </div>

      {/* Main header */}
      <div className="px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: title + meta */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                  subjectColors[pack.subject]
                )}
              >
                {pack.subject}
              </span>
              <Badge variant={statusVariant[pack.status]}>{statusLabels[pack.status]}</Badge>
              <span className="text-sm text-muted-foreground">{pack.grade}</span>
            </div>

            <h1 className="text-2xl font-bold text-foreground leading-snug">{pack.title}</h1>

            <p className="text-sm text-muted-foreground">{pack.examName}</p>

            {/* Stats row */}
            <div className="flex items-center gap-5 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {pack.topicsCount} tópicos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {pack.questionsCount} questões
              </span>
              <span
                className={cn("flex items-center gap-1.5 font-medium", {
                  "text-amber-600": isUrgent,
                  "text-muted-foreground": !isUrgent,
                })}
              >
                {isUrgent ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <CalendarDays className="h-4 w-4" />
                )}
                {daysUntil === null
                  ? "Data não definida"
                  : daysUntil > 0
                  ? `Prova em ${daysUntil} dia${daysUntil !== 1 ? "s" : ""}`
                  : "Prova encerrada"}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <PackActions pack={pack} />
        </div>
      </div>
    </div>
  );
}
