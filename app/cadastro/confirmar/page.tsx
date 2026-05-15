import Link from "next/link";
import { Sparkles, MailCheck } from "lucide-react";

export default async function ConfirmarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sia</h1>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm p-6 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <MailCheck className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Confirme seu e-mail</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta.
            </p>
            {redirectTo && (
              <p className="text-sm text-muted-foreground mt-2">
                Após confirmar, volte ao link do convite para entrar no grupo.
              </p>
            )}
          </div>

          {redirectTo ? (
            <div className="space-y-2">
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                className="block w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                Já confirmei — fazer login
              </Link>
              <Link
                href={redirectTo}
                className="block w-full h-10 rounded-lg border text-sm font-medium flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              >
                Voltar ao convite
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="block w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              Ir para o login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
