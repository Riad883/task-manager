import { z } from "zod";

export const STATUSES = ["todo", "in_progress", "done"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;
export type TaskStatus = (typeof STATUSES)[number];
export type TaskPriority = (typeof PRIORITIES)[number];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};
export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // yyyy-MM-dd or ""
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be 100 characters or less"),
  description: z.string().trim().max(500, "Description must be 500 characters or less"),
  status: z.enum(STATUSES),
  priority: z.enum(PRIORITIES),
  dueDate: z
    .string()
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date"),
  tags: z.array(z.string().trim().min(1).max(20)).max(5, "Up to 5 tags"),
});
export type TaskInput = z.infer<typeof taskInputSchema>;

export interface TaskFilters {
  search: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  sort: "dueDate" | "priority" | "createdAt" | "title";
}
export const DEFAULT_FILTERS: TaskFilters = {
  search: "",
  status: "all",
  priority: "all",
  sort: "createdAt",
};

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export function filterTasks(tasks: Task[], f: TaskFilters): Task[] {
  const q = f.search.trim().toLowerCase();
  const out = tasks.filter((t) => {
    if (f.status !== "all" && t.status !== f.status) return false;
    if (f.priority !== "all" && t.priority !== f.priority) return false;
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
  return out.sort((a, b) => {
    switch (f.sort) {
      case "title":
        return a.title.localeCompare(b.title);
      case "priority":
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      case "dueDate":
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}

export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isOverdue(t: Task, today = todayISO()): boolean {
  return t.status !== "done" && !!t.dueDate && t.dueDate < today;
}

export function getStats(tasks: Task[], today = todayISO()) {
  const done = tasks.filter((t) => t.status === "done").length;
  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    done,
    overdue: tasks.filter((t) => isOverdue(t, today)).length,
    completion: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

export function makeSeedTasks(): Task[] {
  const now = new Date().toISOString();
  const base = (p: Partial<Task> & { title: string }): Task => ({
    id: crypto.randomUUID(),
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...p,
  });
  return [
    base({ title: "Plan quarterly roadmap", description: "Outline goals and milestones for next quarter.", priority: "high", status: "in_progress", dueDate: offsetDate(2), tags: ["planning"] }),
    base({ title: "Review pull requests", priority: "medium", dueDate: offsetDate(0), tags: ["dev"] }),
    base({ title: "Update onboarding docs", description: "Refresh screenshots and setup steps.", priority: "low", dueDate: offsetDate(6), tags: ["docs"] }),
    base({ title: "Fix login page bug", priority: "high", dueDate: offsetDate(-1), tags: ["dev", "bug"] }),
    base({ title: "Team retrospective", priority: "medium", status: "done", dueDate: offsetDate(-3), tags: ["meeting"] }),
  ];
}
