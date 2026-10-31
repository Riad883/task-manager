import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import { todayISO } from "@/lib/tasks";
import { PageHeader, LoadingState } from "@/components/taskflow/AppShell";
import { EmptyState, TaskRow } from "@/components/taskflow/TaskBits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar · TaskFlow" },
      { name: "description", content: "See your tasks by due date on a monthly calendar." },
      { property: "og:title", content: "Calendar · TaskFlow" },
      { property: "og:description", content: "See your tasks by due date on a monthly calendar." },
    ],
  }),
  component: CalendarPage,
});

const DOT: Record<string, string> = { high: "bg-priority-high", medium: "bg-priority-medium", low: "bg-priority-low" };

function CalendarPage() {
  const { tasks, loaded, openCreate } = useTasks();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => todayISO());
  const today = todayISO();

  const days = eachDayOfInterval({ start: startOfWeek(month), end: endOfWeek(endOfMonth(month)) });
  const dayTasks = tasks.filter((t) => t.dueDate === selected);

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Tap a day to see its tasks."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => setMonth((m) => subMonths(m, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="w-36 text-center font-display font-semibold">{format(month, "MMMM yyyy")}</span>
            <Button variant="outline" size="icon" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" onClick={() => { setMonth(startOfMonth(new Date())); setSelected(today); }}>Today</Button>
          </div>
        }
      />
      {!loaded ? <LoadingState /> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border bg-card p-3 shadow-soft">
            <div className="grid grid-cols-7 pb-2 text-center text-xs font-medium text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d) => {
                const iso = format(d, "yyyy-MM-dd");
                const items = tasks.filter((t) => t.dueDate === iso);
                return (
                  <button
                    key={iso}
                    onClick={() => setSelected(iso)}
                    aria-label={`${format(d, "MMMM d")}, ${items.length} tasks`}
                    className={cn(
                      "flex aspect-square flex-col rounded-lg p-1.5 text-left text-sm transition hover:bg-muted sm:aspect-auto sm:min-h-24",
                      !isSameMonth(d, month) && "text-muted-foreground/50",
                      selected === iso && "bg-accent ring-2 ring-primary",
                    )}
                  >
                    <span className={cn("grid h-6 w-6 place-items-center rounded-full text-xs", iso === today && "bg-primary text-primary-foreground font-bold")}>{format(d, "d")}</span>
                    <div className="mt-1 hidden space-y-0.5 sm:block">
                      {items.slice(0, 2).map((t) => (
                        <div key={t.id} className={cn("truncate rounded px-1 text-[11px]", t.status === "done" ? "bg-muted text-muted-foreground line-through" : "bg-primary/10 text-foreground")}>{t.title}</div>
                      ))}
                      {items.length > 2 && <div className="px-1 text-[11px] text-muted-foreground">+{items.length - 2} more</div>}
                    </div>
                    <div className="mt-auto flex gap-0.5 sm:hidden">
                      {items.slice(0, 3).map((t) => <span key={t.id} className={cn("h-1.5 w-1.5 rounded-full", DOT[t.priority])} />)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <aside>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{format(new Date(selected + "T00:00"), "EEEE, MMM d")}</h2>
              <Button size="sm" variant="outline" onClick={() => openCreate({ dueDate: selected })}>Add</Button>
            </div>
            {dayTasks.length === 0 ? (
              <EmptyState icon={<CalendarX className="h-7 w-7" />} title="Free day" text="No tasks due on this date." />
            ) : (
              <div className="space-y-2">{dayTasks.map((t) => <TaskRow key={t.id} task={t} />)}</div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
