import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, BookOpen, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import {
  type StudyPack,
  subjectColors,
  statusLabels,
  getDaysUntilExam,
  getCompletionRate,
  getAccuracyRate,
  mockStudents,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface StudyPackCardProps {
  pack: StudyPack;
}

const statusVariant: Record<string, "success" | "warning" | "draft" | "review" | "secondary"> = {
  published: "success",
  in_review: "review",
  draft: "draft",
  archived: "secondary",
};

// Color strip per subject — with fallback for any subject not listed
const SUBJECT_STRIP_COLORS: Record<string, string> = {
  "Português":   "bg-violet-500",
  "Matemática":  "bg-blue-500",
  "Ciências":    "bg-emerald-500",
  "História":    "bg-amber-500",
  "Geografia":   "bg-teal-500",
  "Inglês":      "bg-sky-500",
  "Biologia":    "bg-green-500",
  "Física":      "bg-indigo-500",
  "Química":     "bg-orange-500",
  "Artes":       "bg-pink-500",
  "Educação Física": "bg-lime-500",
  "Filosofia":   "bg-purple-500",
  "Sociologia":  "bg-rose-500",
};

export function StudyPackCard({ pack }: StudyPackCardProps) {
  const daysUntil = getDaysUntilExam(pack.examDate);
  const completion = getCompletionRate(pack.progress);
  const accuracy = getAccuracyRate(pack.progress);
  const students = mockStudents.filter((s) => pack.studentIds.includes(s.id));
  const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil > 0;
  const isOverdue = daysUntil !== null && daysUntil < 0;

  const stripColor = SUBJECT_STRIP_COLORS[pack.subject] ?? "bg-slate-400";

  return (
    <Link href={`/pacotes/${pack.id}`} className="h-full">
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full flex flex-col">
      {/* Subject color strip */}
      <div className={cn("absolute inset-x-0 top-0 h-1", stripColor)} />

      <CardContent className="pt-5 pb-4 px-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", subjectColors[pack.subject] ?? "bg-slate-100 text-slate-700 border-slate-200")}>
                {pack.subject}
              </span>
              <Badge variant={statusVariant[pack.status]}>{statusLabels[pack.status]}</Badge>
            </div>
            <h3 className="font-semibold text-foreground leading-snug line-clamp-2">{pack.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{pack.grade} · {pack.examName}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {pack.topicsCount} tópicos
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {pack.questionsCount} questões
          </span>
        </div>

        {/* Progress (published packs only) */}
        {pack.status === "published" && pack.progress && (
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progresso do aluno</span>
              <span className="font-medium text-foreground">{completion}%</span>
            </div>
            <Progress value={completion} className="h-1.5" />
            {pack.progress.questionsAnswered > 0 && (
              <p className="text-xs text-muted-foreground">
                {accuracy}% de acerto · {pack.progress.questionsAnswered}/{pack.progress.questionsTotal} questões
              </p>
            )}
          </div>
        )}

        {/* Exam date — pushed to bottom */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", {
            "text-red-600": isOverdue,
            "text-amber-600": isUrgent && !isOverdue,
            "text-muted-foreground": !isUrgent && !isOverdue,
          })}>
            {isOverdue ? <AlertCircle className="h-3.5 w-3.5" /> : isUrgent ? <Clock className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
            {daysUntil === null
              ? "Data não definida"
              : isOverdue
              ? "Prova encerrada"
              : isUrgent
              ? `${daysUntil} dia${daysUntil !== 1 ? "s" : ""} para a prova`
              : `Prova em ${daysUntil} dias`}
          </div>

          {/* Student avatars */}
          <div className="flex -space-x-2">
            {students.slice(0, 3).map((student) => (
              <Avatar key={student.id} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className={cn("text-[9px] font-bold", student.color)}>
                  {student.avatarInitials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        {/* Hover action */}
        <div className="absolute inset-y-0 right-3 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
