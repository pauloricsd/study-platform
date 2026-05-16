// Design System page — read-only reference for all tokens and components used in the platform.

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// ─── helpers ──────────────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-300">{title}</h2>
        {description && <p className="text-xs text-gray-600 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-gray-600 mt-1.5 font-mono">{children}</p>;
}

// ─── Color swatch ─────────────────────────────────────────────────────────────

interface SwatchProps {
  name: string;
  hsl: string;
  textDark?: boolean;
  border?: boolean;
}

function Swatch({ name, hsl, textDark, border }: SwatchProps) {
  return (
    <div className="space-y-1.5">
      <div
        className={`h-12 w-full rounded-lg ${border ? "border border-gray-700" : ""}`}
        style={{ background: `hsl(${hsl})` }}
      />
      <div>
        <p className="text-[11px] text-gray-300 font-medium">{name}</p>
        <p className="text-[10px] text-gray-600 font-mono">{hsl}</p>
      </div>
    </div>
  );
}

// ─── Radius swatch ────────────────────────────────────────────────────────────

function RadiusSwatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="space-y-2">
      <div className={`h-12 w-12 bg-gray-700 border border-gray-600 ${className}`} />
      <Label>{label}</Label>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  return (
    <div className="px-8 py-8 max-w-4xl space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-100">Design System</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tokens, componentes e padrões visuais usados na plataforma Sia.
        </p>
      </div>

      {/* ── Cores ── */}
      <Section title="Paleta de cores" description="CSS variables definidas em globals.css">

        <div className="space-y-6">
          {/* Brand */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Brand</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Swatch name="primary" hsl="250 87% 60%" />
              <Swatch name="primary-foreground" hsl="0 0% 100%" border />
              <Swatch name="ring" hsl="250 87% 60%" />
              <Swatch name="background" hsl="0 0% 100%" border />
            </div>
          </div>

          {/* Neutros */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Neutros</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Swatch name="foreground" hsl="224 71.4% 4.1%" />
              <Swatch name="muted" hsl="220 14.3% 95.9%" border />
              <Swatch name="muted-foreground" hsl="220 8.9% 46.1%" />
              <Swatch name="border" hsl="220 13% 91%" border />
            </div>
          </div>

          {/* Semânticas */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Semânticas</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Swatch name="destructive" hsl="0 84.2% 60.2%" />
              <Swatch name="secondary" hsl="220 14.3% 95.9%" border />
              <Swatch name="accent" hsl="220 14.3% 95.9%" border />
              <Swatch name="card" hsl="0 0% 100%" border />
            </div>
          </div>

          {/* Extended — Badge colors */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Extended (badge / status)</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              <Swatch name="emerald-100" hsl="152 81% 94%" border />
              <Swatch name="emerald-700" hsl="162 72% 30%" />
              <Swatch name="amber-100" hsl="48 96% 89%" border />
              <Swatch name="amber-700" hsl="26 90% 37%" />
              <Swatch name="blue-100" hsl="214 100% 93%" border />
              <Swatch name="blue-700" hsl="221 83% 43%" />
            </div>
          </div>
        </div>
      </Section>

      <Separator className="border-gray-800" />

      {/* ── Tipografia ── */}
      <Section title="Tipografia" description="Escala de tamanhos e pesos — Inter (sistema)">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
          {[
            { label: "text-xs · 12px", cls: "text-xs", sample: "Legenda, metadado, badge" },
            { label: "text-sm · 14px", cls: "text-sm", sample: "Corpo padrão, labels de campo" },
            { label: "text-base · 16px", cls: "text-base", sample: "Parágrafo, input de texto" },
            { label: "text-lg · 18px", cls: "text-lg font-medium", sample: "Subtítulo de seção" },
            { label: "text-xl · 20px", cls: "text-xl font-bold", sample: "Título de página" },
            { label: "text-2xl · 24px", cls: "text-2xl font-bold tabular-nums", sample: "Número de métrica" },
          ].map(({ label, cls, sample }) => (
            <div key={label} className="flex items-baseline gap-4">
              <span className="w-44 text-[10px] text-gray-600 font-mono shrink-0">{label}</span>
              <span className={`text-white ${cls}`}>{sample}</span>
            </div>
          ))}
        </div>
      </Section>

      <Separator className="border-gray-800" />

      {/* ── Border radius ── */}
      <Section title="Border radius" description="Variáveis via --radius (0.75rem base)">
        <div className="flex items-end gap-8">
          <div>
            <RadiusSwatch label="rounded-sm · 0.5rem" className="rounded-sm" />
          </div>
          <div>
            <RadiusSwatch label="rounded-md · 0.625rem" className="rounded-md" />
          </div>
          <div>
            <RadiusSwatch label="rounded-lg · 0.75rem" className="rounded-lg" />
          </div>
          <div>
            <RadiusSwatch label="rounded-xl · 0.875rem" className="rounded-xl" />
          </div>
          <div>
            <RadiusSwatch label="rounded-full" className="rounded-full" />
          </div>
        </div>
      </Section>

      <Separator className="border-gray-800" />

      {/* ── Button ── */}
      <Section title="Button" description="components/ui/button.tsx — variantes e tamanhos">
        <div className="rounded-xl border border-gray-800 bg-white p-6 space-y-6">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Variantes</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Tamanhos</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button size="lg">Large</Button>
              <Button size="default">Default</Button>
              <Button size="sm">Small</Button>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Estado desabilitado</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button disabled>Default</Button>
              <Button variant="outline" disabled>Outline</Button>
              <Button variant="secondary" disabled>Secondary</Button>
            </div>
          </div>
        </div>
      </Section>

      <Separator className="border-gray-800" />

      {/* ── Badge ── */}
      <Section title="Badge" description="components/ui/badge.tsx — variantes de status">
        <div className="rounded-xl border border-gray-800 bg-white p-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="default">default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="outline">outline</Badge>
            <Badge variant="destructive">destructive</Badge>
            <Badge variant="success">published</Badge>
            <Badge variant="warning">in_review</Badge>
            <Badge variant="draft">draft</Badge>
            <Badge variant="review">review</Badge>
          </div>
        </div>
      </Section>

      <Separator className="border-gray-800" />

      {/* ── Progress ── */}
      <Section title="Progress" description="components/ui/progress.tsx — barra de progresso">
        <div className="rounded-xl border border-gray-800 bg-white p-6 space-y-4">
          {[0, 25, 50, 75, 100].map((v) => (
            <div key={v} className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-8 text-right tabular-nums">{v}%</span>
              <Progress value={v} className="flex-1" />
            </div>
          ))}
        </div>
      </Section>

      <Separator className="border-gray-800" />

      {/* ── Avatar ── */}
      <Section title="Avatar" description="components/ui/avatar.tsx — iniciais com cores de avatar">
        <div className="rounded-xl border border-gray-800 bg-white p-6">
          <div className="flex flex-wrap gap-4 items-center">
            {[
              { initials: "AB", color: "#6366f1" },
              { initials: "CD", color: "#f59e0b" },
              { initials: "EF", color: "#10b981" },
              { initials: "GH", color: "#ef4444" },
              { initials: "IJ", color: "#8b5cf6" },
              { initials: "KL", color: "#0ea5e9" },
            ].map(({ initials, color }) => (
              <div key={initials} className="flex flex-col items-center gap-1.5">
                <Avatar>
                  <AvatarFallback style={{ background: color }} className="text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-mono" style={{ color }}>{color}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Separator className="border-gray-800" />

      {/* ── Inventário de componentes ── */}
      <Section title="Inventário de componentes" description="Todos os componentes disponíveis em components/ui/">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: "Button", path: "components/ui/button.tsx", variants: "6 variantes · 4 tamanhos" },
            { name: "Badge", path: "components/ui/badge.tsx", variants: "8 variantes" },
            { name: "Card", path: "components/ui/card.tsx", variants: "Card, Header, Content, Footer" },
            { name: "Avatar", path: "components/ui/avatar.tsx", variants: "AvatarFallback, AvatarImage" },
            { name: "Progress", path: "components/ui/progress.tsx", variants: "value 0–100" },
            { name: "Separator", path: "components/ui/separator.tsx", variants: "horizontal · vertical" },
            { name: "Tooltip", path: "components/ui/tooltip.tsx", variants: "Provider, Trigger, Content" },
            { name: "Input", path: "components/ui/input.tsx", variants: "base input" },
            { name: "Dialog", path: "components/ui/dialog.tsx", variants: "Modal completo" },
            { name: "DropdownMenu", path: "components/ui/dropdown-menu.tsx", variants: "Radix DropdownMenu" },
          ].map(({ name, path, variants }) => (
            <div key={name} className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-1">
              <p className="text-sm font-semibold text-gray-200">{name}</p>
              <p className="text-[10px] text-gray-600 font-mono">{path}</p>
              <p className="text-[11px] text-gray-500">{variants}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
