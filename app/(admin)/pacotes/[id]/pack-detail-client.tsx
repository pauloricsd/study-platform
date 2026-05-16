"use client";

import { useState } from "react";
import { SectionCard } from "@/components/pack/section-card";
import { ExerciseItem } from "@/components/pack/exercise-item";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type StudyPack, mockStudents, getCompletionRate, getAccuracyRate } from "@/lib/mock-data";
import { type Topic, type Exercise, sectionTypeConfig } from "@/lib/mock-topics";
import { type PackReport } from "@/lib/data/reports";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckSquare,
  Users,
  ChevronRight,
  ChevronDown,
  BarChart2,
  Target,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const tabs = [
  { id: "content", label: "Conteúdo", icon: BookOpen },
  { id: "exercises", label: "Exercícios", icon: CheckSquare },
  { id: "progress", label: "Progresso", icon: Users },
  { id: "report", label: "Relatório", icon: BarChart2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface PackDetailClientProps {
  pack: StudyPack;
  topics: Topic[];
  exercises: Exercise[];
  report: PackReport;
}

export function PackDetailClient({ pack, topics, exercises, report }: PackDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("content");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.id ?? "");
  const [topicsOpen, setTopicsOpen] = useState(false);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId);
  const topicExercises = exercises.filter((e) => e.topicId === selectedTopicId);

  const students = mockStudents.filter((s) => pack.studentIds.includes(s.id));
  const completion = getCompletionRate(pack.progress);
  const accuracy = getAccuracyRate(pack.progress);

  return (
    <div className="flex flex-col">
      {/* Tabs bar */}
      <div className="border-b bg-white px-6">
        <div className="flex gap-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "exercises" && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none",
                  activeTab === id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {exercises.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content tab */}
      {activeTab === "content" && (
        <div className="flex flex-1 min-h-0">
          {/* Topic sidebar — desktop only */}
          <aside className="hidden md:block w-64 shrink-0 border-r bg-white overflow-y-auto">
            <div className="p-3 space-y-0.5">
              <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tópicos
              </p>
              {topics.map((topic, idx) => {
                const active = topic.id === selectedTopicId;
                const topicExCount = exercises.filter((e) => e.topicId === topic.id).length;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2.5 transition-colors group",
                      active
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5",
                        active ? "bg-primary text-white" : "bg-muted-foreground/20 text-muted-foreground"
                      )}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium leading-snug truncate", active && "text-primary")}>
                          {topic.title}
                        </p>
                        <p className="text-xs mt-0.5 opacity-70">
                          {topic.sections.length} seções · {topicExCount} questões
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Topic content */}
          <main className="flex-1 overflow-y-auto">
            {/* Mobile collapsible topics */}
            <div className="md:hidden border-b bg-white">
              <button
                onClick={() => setTopicsOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  {selectedTopic
                    ? `Tópico ${topics.indexOf(selectedTopic) + 1} de ${topics.length}: ${selectedTopic.title}`
                    : "Tópicos"}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", topicsOpen && "rotate-180")} />
              </button>
              {topicsOpen && (
                <div className="border-t divide-y bg-white">
                  {topics.map((topic, idx) => {
                    const active = topic.id === selectedTopicId;
                    const topicExCount = exercises.filter((e) => e.topicId === topic.id).length;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => { setSelectedTopicId(topic.id); setTopicsOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors",
                          active ? "bg-primary/5" : "hover:bg-muted/50"
                        )}
                      >
                        <span className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5",
                          active ? "bg-primary text-white" : "bg-muted-foreground/20 text-muted-foreground"
                        )}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium leading-snug", active ? "text-primary" : "text-foreground")}>
                            {topic.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {topic.sections.length} seções · {topicExCount} questões
                          </p>
                        </div>
                        {active && <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6">
            {selectedTopic ? (
              <div className="max-w-2xl space-y-4">
                {/* Topic header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>Tópico {topics.indexOf(selectedTopic) + 1} de {topics.length}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>{pack.subject}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{selectedTopic.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTopic.summary}</p>

                  {/* Section type legend */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(["explanation", "example", "note", "common_mistake", "summary"] as const)
                      .filter((type) => selectedTopic.sections.some((s) => s.type === type))
                      .map((type) => (
                        <span
                          key={type}
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                            sectionTypeConfig[type].bg,
                            sectionTypeConfig[type].border,
                            sectionTypeConfig[type].color
                          )}
                        >
                          {sectionTypeConfig[type].label}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Sections */}
                {selectedTopic.sections.map((section) => (
                  <SectionCard key={section.id} section={section} />
                ))}

                {/* Navigation between topics */}
                <div className="flex items-center justify-between pt-4 border-t mt-6">
                  {topics.indexOf(selectedTopic) > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTopicId(topics[topics.indexOf(selectedTopic) - 1].id)}
                    >
                      ← Tópico anterior
                    </Button>
                  ) : <div />}
                  {topics.indexOf(selectedTopic) < topics.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setSelectedTopicId(topics[topics.indexOf(selectedTopic) + 1].id)}
                    >
                      Próximo tópico →
                    </Button>
                  ) : <div />}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum tópico encontrado.</p>
            )}
            </div>
          </main>
        </div>
      )}

      {/* Exercises tab */}
      {activeTab === "exercises" && (
        <div className="flex flex-1 min-h-0">
          {/* Topic filter sidebar — desktop only */}
          <aside className="hidden md:block w-64 shrink-0 border-r bg-white overflow-y-auto">
            <div className="p-3 space-y-0.5">
              <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Filtrar por tópico
              </p>
              <button
                onClick={() => setSelectedTopicId("")}
                className={cn(
                  "w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  selectedTopicId === ""
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                Todos ({exercises.length})
              </button>
              {topics.map((topic) => {
                const count = exercises.filter((e) => e.topicId === topic.id).length;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors",
                      selectedTopicId === topic.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="truncate block">{topic.title}</span>
                    <span className="text-xs opacity-70">{count} questões</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Exercise list */}
          <main className="flex-1 overflow-y-auto">
            {/* Mobile collapsible topic filter */}
            <div className="md:hidden border-b bg-white">
              <button
                onClick={() => setTopicsOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
              >
                <span className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  {selectedTopicId === ""
                    ? `Todos os exercícios (${exercises.length})`
                    : `${topics.find((t) => t.id === selectedTopicId)?.title ?? "Tópico"}`}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", topicsOpen && "rotate-180")} />
              </button>
              {topicsOpen && (
                <div className="border-t divide-y bg-white">
                  <button
                    onClick={() => { setSelectedTopicId(""); setTopicsOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm font-medium transition-colors",
                      selectedTopicId === "" ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted/50"
                    )}
                  >
                    Todos ({exercises.length})
                  </button>
                  {topics.map((topic) => {
                    const count = exercises.filter((e) => e.topicId === topic.id).length;
                    const active = selectedTopicId === topic.id;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => { setSelectedTopicId(topic.id); setTopicsOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-3 transition-colors",
                          active ? "bg-primary/5" : "hover:bg-muted/50"
                        )}
                      >
                        <p className={cn("text-sm font-medium", active ? "text-primary" : "text-foreground")}>{topic.title}</p>
                        <p className="text-xs text-muted-foreground">{count} questões</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 md:p-6">
            <div className="max-w-2xl space-y-4">
              {(selectedTopicId === "" ? exercises : exercises.filter((e) => e.topicId === selectedTopicId))
                .sort((a, b) => a.order - b.order)
                .map((exercise, idx) => (
                  <ExerciseItem key={exercise.id} exercise={exercise} number={idx + 1} />
                ))}
            </div>
            </div>
          </main>
        </div>
      )}

      {/* Report tab */}
      {activeTab === "report" && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl space-y-6">
            {report.topicStats.length === 0 && report.worstExercises.length === 0 && report.studentStats.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center">
                <BarChart2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhum dado ainda — os relatórios aparecerão conforme os alunos estudam.
                </p>
              </div>
            ) : (
              <>
                {/* Topic performance */}
                {report.topicStats.length > 0 && (
                  <section>
                    <div className="rounded-xl border bg-white p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Desempenho por tópico</h3>
                      <div className="space-y-3">
                        {report.topicStats.map((stat) => (
                          <div key={stat.topicId} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-foreground truncate mr-3">{stat.topicTitle}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-muted-foreground">{stat.avgScore}%</span>
                                <span className="text-xs text-muted-foreground">
                                  {stat.studentCount} {stat.studentCount === 1 ? "aluno" : "alunos"}
                                </span>
                              </div>
                            </div>
                            <Progress
                              value={stat.avgScore}
                              className={cn(
                                "h-2",
                                stat.avgScore >= 70
                                  ? "[&>div]:bg-emerald-500"
                                  : stat.avgScore >= 40
                                  ? "[&>div]:bg-amber-500"
                                  : "[&>div]:bg-red-500"
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Worst exercises */}
                {report.worstExercises.length > 0 && (
                  <section>
                    <div className="rounded-xl border bg-white p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Questões com mais erros
                      </h3>
                      <div className="space-y-3">
                        {report.worstExercises.map((ex) => (
                          <div key={ex.exerciseId} className="flex items-start justify-between gap-3 py-2 border-b last:border-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground line-clamp-2">{ex.statement}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{ex.topicTitle}</p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                {Math.round(ex.errorRate * 100)}% erro
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {ex.totalResponses} {ex.totalResponses === 1 ? "resposta" : "respostas"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Student progress */}
                {report.studentStats.length > 0 && (
                  <section>
                    <div className="rounded-xl border bg-white p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Progresso por aluno
                      </h3>
                      <div className="divide-y">
                        {report.studentStats.map((student) => (
                          <div key={student.studentId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarFallback
                                className={cn(
                                  "text-xs font-bold",
                                  student.avatarColor ?? "bg-muted text-muted-foreground"
                                )}
                              >
                                {student.avatarInitials ?? student.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground truncate">{student.name}</span>
                                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                  {student.topicsCompleted}/{student.totalTopics} tópicos
                                </span>
                              </div>
                              {student.avgScore === -1 ? (
                                <p className="text-xs text-muted-foreground">Não iniciou</p>
                              ) : (
                                <>
                                  <Progress
                                    value={student.avgScore}
                                    className={cn(
                                      "h-1.5",
                                      student.avgScore >= 70
                                        ? "[&>div]:bg-emerald-500"
                                        : student.avgScore >= 40
                                        ? "[&>div]:bg-amber-500"
                                        : "[&>div]:bg-red-500"
                                    )}
                                  />
                                  {student.lastActiveAt && (
                                    <p className="text-xs text-muted-foreground">
                                      Último acesso:{" "}
                                      {new Date(student.lastActiveAt).toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Progress tab */}
      {activeTab === "progress" && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl space-y-6">
            {pack.status !== "published" ? (
              <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
                <BarChart2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Pacote ainda não publicado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Publique este pacote para que os alunos possam estudar e o progresso apareça aqui.
                </p>
              </div>
            ) : (
              <>
                {/* Overall stats */}
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Visão geral</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Conclusão", value: `${completion}%`, icon: TrendingUp, color: "text-primary" },
                      { label: "Taxa de acerto", value: `${accuracy}%`, icon: Target, color: "text-emerald-600" },
                      {
                        label: "Questões respondidas",
                        value: `${pack.progress?.questionsAnswered ?? 0}/${pack.progress?.questionsTotal ?? 0}`,
                        icon: CheckSquare,
                        color: "text-amber-600",
                      },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="rounded-xl border bg-white p-4 text-center space-y-1">
                        <Icon className={cn("h-5 w-5 mx-auto", color)} />
                        <p className="text-xl font-bold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Per topic */}
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Progresso por tópico</h3>
                  <div className="rounded-xl border bg-white divide-y">
                    {topics.map((topic, idx) => {
                      const topicProgress = Math.max(0, Math.min(100, (completion - idx * 15)));
                      return (
                        <div key={topic.id} className="px-4 py-3 space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{topic.title}</span>
                            <span className="text-muted-foreground">{Math.round(topicProgress)}%</span>
                          </div>
                          <Progress value={topicProgress} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Per student */}
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Por aluno</h3>
                  <div className="rounded-xl border bg-white divide-y">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center gap-3 px-4 py-3.5">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className={cn("text-xs font-bold", student.color)}>
                            {student.avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{student.name}</span>
                            <span className="text-muted-foreground">{completion}%</span>
                          </div>
                          <Progress value={completion} className="h-1.5" />
                          <p className="text-xs text-muted-foreground">
                            {accuracy}% de acerto · {pack.progress?.questionsAnswered}/{pack.progress?.questionsTotal} questões
                          </p>
                        </div>
                        <Badge variant={completion === 100 ? "success" : "secondary"} className="shrink-0">
                          {completion === 100 ? "Concluído" : "Em andamento"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
