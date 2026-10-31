import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ListChecks, Loader2, Plus, Inbox } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { getStats, isOverdue, todayISO } from "@/lib/tasks";
import { PageHeader, LoadingState } from "@/components/taskflow/AppShell";
import { EmptyState, TaskRow } from "@/components/taskflow/TaskBits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · TaskFlow" },
      { name: "description", content: "Your TaskFlow overview: progress, overdue items and what's due next." },
      { property: "og:title", content: "Dashboard · TaskFlow" },
      { property: "og:description", content: "Your TaskFlow overview: progress, overdue items and what's due next." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { tasks, loaded, error, openCreate } = useTasks();
  if (!loaded) return <LoadingState />;
  if (error) return <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title="Something went wrong" text={error} />;
  const s = getStats(tasks);
  const today = todayISO();
  const upcoming = tasks
    .filter((t) => t.status !== "done" && (isOverdue(t, today) || (t.dueDate && t.dueDate >= today)))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const cards = [
    { label: "Total tasks", value: s.total, icon: ListChecks },
    { label: "In progress", value: s.inProgress, icon: Loader2 },
    { label: "Completed", value: s.done, icon: CheckCircle2 },
    { label: "Overdue", value: s.overdue, icon: AlertTriangle, alert: s.overdue > 0 },
  ];

  return (
    <>
      <PageHeader title="Good to see you" subtitle="Here's where your work stands today." action={<Button onClick={() => openCreate()}><Plus className="mr-1 h-4 w-4" />New task</Button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, alert }) => (
          <div key={label} className="rounded-2xl border bg-card p-5 shadow-soft">
            <Icon className={alert ? "h-5 w-5 text-destructive" : "h-5 w-5 text-primary"} />
            <p className="mt-4 font-display text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-hero p-6 text-primary-foreground shadow-lift">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-lg font-semibold">Overall progress</p>
          <p className="font-display text-3xl font-bold">{s.completion}%</p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full rounded-full bg-highlight transition-all" style={{ width: `${s.completion}%` }} />
        </div>
        <p className="mt-2 text-sm opacity-80">{s.done} of {s.total} tasks done · {s.todo} still to start</p>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Due soon</h2>
          <Link to="/tasks" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState icon={<Inbox className="h-8 w-8" />} title="Nothing due" text="No open tasks with upcoming due dates." action={<Button variant="outline" onClick={() => openCreate()}>Add a task</Button>} />
        ) : (
          <div className="space-y-2">{upcoming.map((t) => <TaskRow key={t.id} task={t} />)}</div>
        )}
      </section>
    </>
  );
}
