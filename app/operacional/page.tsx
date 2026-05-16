import { getOverviewMetrics } from "@/lib/data/operational";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  FileText,
  CheckSquare,
  MessageCircle,
  Upload,
  ShieldAlert,
  Ban,
  BarChart2,
  Layers,
  TrendingUp,
  UserCheck,
} from "lucide-react";

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  sub,
  color = "default",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  sub?: string;
  color?: "default" | "emerald" | "blue" | "amber" | "red" | "violet";
}) {
  const colors = {
    default: "text-gray-400 bg-gray-800",
    emerald: "text-emerald-400 bg-emerald-950/60",
    blue: "text-blue-400 bg-blue-950/60",
    amber: "text-amber-400 bg-amber-950/60",
    red: "text-red-400 bg-red-950/60",
    violet: "text-violet-400 bg-violet-950/60",
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors[color]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-100 tabular-nums">
          {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
        </p>
        {sub && <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-gray-300">{title}</h2>
      {description && <p className="text-xs text-gray-600 mt-0.5">{description}</p>}
    </div>
  );
}

// ─── Placeholder card (dados externos — fase futura) ──────────────────────────

function PlaceholderCard({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-gray-800/60 bg-gray-900/40 p-4 space-y-3 opacity-50">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-600">{label}</p>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-800/60">
          <Icon className="h-3.5 w-3.5 text-gray-600" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-700">—</p>
        <p className="text-[11px] text-gray-700 mt-0.5">dados externos · fase futura</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OperationalOverviewPage() {
  const m = await getOverviewMetrics();

  return (
    <div className="px-8 py-8 max-w-5xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-100">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Métricas gerais da plataforma em tempo real.
        </p>
      </div>

      {/* Usuários */}
      <section>
        <SectionHeader
          title="Usuários"
          description="Todos os perfis cadastrados na plataforma."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="Total de usuários"
            value={m.totalUsers}
            icon={Users}
            color="blue"
          />
          <MetricCard
            label="Alunos"
            value={m.totalStudents}
            icon={GraduationCap}
            color="emerald"
            sub={`${m.totalAdmins} admin${m.totalAdmins !== 1 ? "s" : ""}`}
          />
          <MetricCard
            label="Admins"
            value={m.totalAdmins}
            icon={UserCheck}
          />
          <MetricCard
            label="Acesso operacional"
            value={m.totalOperational}
            icon={ShieldCheck}
            color="violet"
          />
        </div>
      </section>

      {/* Conteúdo */}
      <section>
        <SectionHeader
          title="Conteúdo"
          description="Pacotes de estudo, tópicos, seções e exercícios."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Pacotes publicados"
            value={m.publishedPacks}
            icon={BookOpen}
            color="emerald"
            sub={`${m.totalPacks} total · ${m.draftPacks} rascunho`}
          />
          <MetricCard
            label="Tópicos"
            value={m.totalTopics}
            icon={Layers}
            sub={`${m.totalSections} seções de conteúdo`}
          />
          <MetricCard
            label="Exercícios"
            value={m.totalExercises}
            icon={CheckSquare}
            color="blue"
          />
        </div>
      </section>

      {/* Atividade */}
      <section>
        <SectionHeader
          title="Atividade dos alunos"
          description="Respostas e progresso registrados."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Respostas a exercícios"
            value={m.totalResponses}
            icon={TrendingUp}
            color="emerald"
          />
          <MetricCard
            label="Registros de progresso"
            value={m.totalTopicProgress}
            icon={BarChart2}
          />
          <MetricCard
            label="PDFs enviados"
            value={m.totalUploads}
            icon={Upload}
            color="blue"
          />
        </div>
      </section>

      {/* Tutor IA */}
      <section>
        <SectionHeader
          title="Tutor IA"
          description="Uso do assistente pedagógico pelos alunos."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="Sessões iniciadas"
            value={m.totalTutorSessions}
            icon={MessageCircle}
            color="violet"
            sub={`${m.studyModeSessions} estudo · ${m.exerciseModeSessions} exercício`}
          />
          <MetricCard
            label="Mensagens trocadas"
            value={m.totalTutorMessages}
            icon={FileText}
            color="violet"
          />
          <MetricCard
            label="Eventos de segurança"
            value={m.totalSafetyEvents}
            icon={ShieldAlert}
            color={m.totalSafetyEvents > 0 ? "amber" : "default"}
          />
          <MetricCard
            label="Respostas diretas bloqueadas"
            value={m.blockedDirectAnswers}
            icon={Ban}
            color={m.blockedDirectAnswers > 0 ? "red" : "default"}
          />
        </div>
      </section>

      {/* Dados externos — fase futura */}
      <section>
        <SectionHeader
          title="Sistema & Infraestrutura"
          description="Dados externos — serão conectados em fase futura."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PlaceholderCard label="Uso de storage" icon={Upload} />
          <PlaceholderCard label="Custo estimado de IA" icon={BarChart2} />
          <PlaceholderCard label="Tempo médio de resposta" icon={TrendingUp} />
          <PlaceholderCard label="Taxa de erro" icon={ShieldAlert} />
        </div>
      </section>
    </div>
  );
}
