import { AppShell } from "@/components/layout/app-shell";

export default function StudentBrowsingLayout({ children }: { children: React.ReactNode }) {
  return <AppShell variant="student">{children}</AppShell>;
}
