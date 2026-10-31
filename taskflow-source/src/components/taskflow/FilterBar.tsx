import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_FILTERS, PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL, type TaskFilters } from "@/lib/tasks";

export function FilterBar({ value, onChange, hideStatus }: { value: TaskFilters; onChange: (f: TaskFilters) => void; hideStatus?: boolean }) {
  const set = <K extends keyof TaskFilters>(k: K, v: TaskFilters[K]) => onChange({ ...value, [k]: v });
  const active = value.search || value.status !== "all" || value.priority !== "all";
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Search tasks" placeholder="Search title, description or #tag" className="pl-9" value={value.search} onChange={(e) => set("search", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        {!hideStatus && (
          <Select value={value.status} onValueChange={(v) => set("status", v as TaskFilters["status"])}>
            <SelectTrigger aria-label="Filter by status" className="sm:w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={value.priority} onValueChange={(v) => set("priority", v as TaskFilters["priority"])}>
          <SelectTrigger aria-label="Filter by priority" className="sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={value.sort} onValueChange={(v) => set("sort", v as TaskFilters["sort"])}>
          <SelectTrigger aria-label="Sort tasks" className="sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Newest</SelectItem>
            <SelectItem value="dueDate">Due date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="title">Title A–Z</SelectItem>
          </SelectContent>
        </Select>
        {active && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...DEFAULT_FILTERS, sort: value.sort })}>
            <X className="mr-1 h-4 w-4" />Clear
          </Button>
        )}
      </div>
    </div>
  );
}
