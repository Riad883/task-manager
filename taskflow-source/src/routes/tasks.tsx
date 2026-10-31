import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, SearchX, ClipboardList } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { DEFAULT_FILTERS, filterTasks } from "@/lib/tasks";
import { PageHeader, LoadingState } from "@/components/taskflow/AppShell";
import { FilterBar } from "@/components/taskflow/FilterBar";
import { EmptyState, TaskRow } from "@/components/taskflow/TaskBits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "All tasks · TaskFlow" },
      { name: "description", content: "Search, filter and manage every task in TaskFlow." },
      { property: "og:title", content: "All tasks · TaskFlow" },
      { property: "og:description", content: "Search, filter and manage every task in TaskFlow." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { tasks, loaded, openCreate } = useTasks();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const list = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const add = <Button onClick={() => openCreate()}><Plus className="mr-1 h-4 w-4" />New task</Button>;

  return (
    <>
      <PageHeader title="Tasks" subtitle={`${tasks.length} total`} action={add} />
      <FilterBar value={filters} onChange={setFilters} />
      <div className="mt-5">
        {!loaded ? <LoadingState /> : tasks.length === 0 ? (
          <EmptyState icon={<ClipboardList className="h-8 w-8" />} title="No tasks yet" text="Create your first task to get started." action={add} />
        ) : list.length === 0 ? (
          <EmptyState icon={<SearchX className="h-8 w-8" />} title="No matches" text="Try a different search or clear the filters." action={<Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</Button>} />
        ) : (
          <div className="space-y-2">{list.map((t) => <TaskRow key={t.id} task={t} />)}</div>
        )}
      </div>
    </>
  );
}
