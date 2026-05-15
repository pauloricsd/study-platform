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

export function StudyPackCard({ pack }: StudyPackCardProps) {
  const daysUntil = getDaysUntilExam(pack.examDate);
  const completion = getCompletionRate(pack.progress);
  const accuracy = getAccuracyRate(pack.progress);
  const students = mockStudents.filter((s) => pack.studentIds.includes(s.id));
  const isUrgent = daysUntil <= 7 && daysUntil > 0;
  const isOverdue = daysUntil < 0;

  return (
    <Link href={`/pacotes/${pack.id}`}>
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
      {/* Subject color strip */}
      <div className={cn("absolute inset-x-0 top-0 h-1", {
        "bg-violet-500": pack.subject === "Português",
        "bg-blue-500": pack.subject === "Matemática",
        "bg-emerald-500": pack.subject === "Ciências",
        "bg-amber-500": pack.subject === "História",
        "bg-teal-500": pack.subject === "Geografia",
        "bg-sky-500": pack.subject === "Inglês",
        "bg-green-500": pack.subject === "Biologia",
        "bg-indigo-500": pack.subject === "Física",
        "bg-orange-500": pack.subject === "Química",
      })} />

      <CardContent className="pt-5 pb-4 px-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", subjectColors[pack.subject])}>
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

        {/* Exam date */}
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", {
            "text-red-600": isOverdue,
            "text-amber-600": isUrgent && !isOverdue,
            "text-muted-foreground": !isUrgent && !isOverdue,
          })}>
            {isOverdue ? <AlertCircle className="h-3.5 w-3.5" /> : isUrgent ? <Clock className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
            {isOverdue
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
