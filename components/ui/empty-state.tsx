import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;   // e.g. "text-primary"
  iconBg?: string;      // e.g. "bg-primary/10"
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Extra decorative icons shown faded in the background corners */
  decorative?: boolean;
}

export function EmptyState({
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  title,
  description,
  action,
  className,
  decorative = false,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "relative flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white px-8 py-16 text-center overflow-hidden",
      className
    )}>
      {/* Decorative background circles */}
      {decorative && (
        <>
          <div className={cn("absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-5", iconBg.replace("/10", ""))} />
          <div className={cn("absolute -bottom-8 -left-8 h-32 w-32 rounded-full opacity-5", iconBg.replace("/10", ""))} />
        </>
      )}

      {/* Icon */}
      <div className={cn(
        "relative flex h-16 w-16 items-center justify-center rounded-2xl mb-5",
        iconBg
      )}>
        <Icon className={cn("h-8 w-8", iconColor)} strokeWidth={1.5} />
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
