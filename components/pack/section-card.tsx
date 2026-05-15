import { type Section, sectionTypeConfig } from "@/lib/mock-topics";
import { cn } from "@/lib/utils";
import { Lightbulb, BookOpen, ListChecks, AlertTriangle, AlertCircle } from "lucide-react";

const sectionIcons = {
  explanation: BookOpen,
  example: Lightbulb,
  summary: ListChecks,
  note: AlertCircle,
  common_mistake: AlertTriangle,
};

interface SectionCardProps {
  section: Section;
}

function renderContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className={cn("text-sm leading-relaxed", i > 0 && line ? "mt-1.5" : "")}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

export function SectionCard({ section }: SectionCardProps) {
  const config = sectionTypeConfig[section.type];
  const Icon = sectionIcons[section.type];

  return (
    <div className={cn("rounded-xl border p-5 space-y-3", config.bg, config.border)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", config.color)} />
        <span className={cn("text-xs font-semibold uppercase tracking-wide", config.color)}>
          {section.title || config.label}
        </span>
      </div>
      <div className={cn("space-y-0", config.color.replace("700", "800"))}>
        {renderContent(section.content)}
      </div>
    </div>
  );
}
