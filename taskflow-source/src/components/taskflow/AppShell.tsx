import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ListChecks, Columns3, CalendarDays, Plus, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/board", label: "Board", icon: Columns3 },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { openCreate } = useTasks();
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar p-5 md:flex md:sticky md:top-0 md:h-screen">
        <Link to="/" className="mb-8 flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Workflow className="h-4 w-4" /></span>
          TaskFlow
        </Link>
        <nav className="space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="nav-link" activeProps={{ className: "nav-link-active" }}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>
        <Button className="mt-auto" onClick={() => openCreate()}><Plus className="mr-1 h-4 w-4" />New task</Button>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Workflow className="h-4 w-4" /></span>
          TaskFlow
        </Link>
        <Button size="sm" onClick={() => openCreate()} aria-label="New task"><Plus className="h-4 w-4" /></Button>
      </header>

      <main className="flex-1 px-4 pb-24 pt-6 md:px-10 md:pb-10 md:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t bg-background md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: to === "/" }} className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground" activeProps={{ className: "text-primary font-medium" }}>
            <Icon className="h-5 w-5" />{label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-3" aria-busy="true">
      {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
    </div>
  );
}
