import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import { DEFAULT_FILTERS, filterTasks, STATUSES, STATUS_LABEL, type TaskStatus } from "@/lib/tasks";
import { PageHeader, LoadingState } from "@/components/taskflow/AppShell";
import { FilterBar } from "@/components/taskflow/FilterBar";
import { TaskCard } from "@/components/taskflow/TaskBits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "Kanban board · TaskFlow" },
      { name: "description", content: "Drag tasks between To do, In progress and Done." },
      { property: "og:title", content: "Kanban board · TaskFlow" },
      { property: "og:description", content: "Drag tasks between To do, In progress and Done." },
    ],
  }),
  component: Board,
});

function Board() {
  const { tasks, loaded, updateTask, openCreate } = useTasks();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [over, setOver] = useState<TaskStatus | null>(null);
  const list = useMemo(() => filterTasks(tasks, { ...filters, status: "all" }), [tasks, filters]);

  return (
    <>
      <PageHeader title="Board" subtitle="Drag cards between columns, or use the ⋯ menu." />
      <FilterBar value={filters} onChange={setFilters} hideStatus />
      {!loaded ? <div className="mt-5"><LoadingState /></div> : (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {STATUSES.map((s) => {
            const col = list.filter((t) => t.status === s);
            return (
              <section
                key={s}
                aria-label={`${STATUS_LABEL[s]} column`}
                onDragOver={(e) => { e.preventDefault(); setOver(s); }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(null);
                  const id = e.dataTransfer.getData("text/plain");
                  const t = tasks.find((x) => x.id === id);
                  if (t && t.status !== s) updateTask(id, { status: s });
                }}
                className={cn("flex min-h-64 flex-col rounded-2xl bg-muted/60 p-3 transition", over === s && "ring-2 ring-primary")}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="font-display font-semibold">{STATUS_LABEL[s]} <span className="ml-1 text-sm text-muted-foreground">{col.length}</span></h2>
                  <Button size="icon" variant="ghost" className="h-7 w-7" aria-label={`Add task to ${STATUS_LABEL[s]}`} onClick={() => openCreate({ status: s })}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex-1 space-y-2">
                  {col.length === 0 ? (
                    <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">Drop tasks here</p>
                  ) : col.map((t) => <TaskCard key={t.id} task={t} draggable />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
