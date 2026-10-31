import { useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, MoreHorizontal, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import {
  isOverdue, PRIORITY_LABEL, STATUS_LABEL, STATUSES,
  type Task, type TaskPriority, type TaskStatus,
} from "@/lib/tasks";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  high: "bg-priority-high/15 text-priority-high",
  medium: "bg-priority-medium/20 text-priority-medium-foreground",
  low: "bg-priority-low/15 text-priority-low",
};
const STATUS_CLASS: Record<TaskStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-accent text-accent-foreground",
  done: "bg-primary/15 text-primary",
};

export function PriorityBadge({ p }: { p: TaskPriority }) {
  return <span className={cn("chip", PRIORITY_CLASS[p])}>{PRIORITY_LABEL[p]}</span>;
}
export function StatusBadge({ s }: { s: TaskStatus }) {
  return <span className={cn("chip", STATUS_CLASS[s])}>{STATUS_LABEL[s]}</span>;
}

export function DueDate({ task }: { task: Task }) {
  if (!task.dueDate) return null;
  const late = isOverdue(task);
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", late ? "text-destructive font-medium" : "text-muted-foreground")}>
      <CalendarDays className="h-3.5 w-3.5" />
      {format(parseISO(task.dueDate), "MMM d")}
      {late && " · overdue"}
    </span>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center">
      <div className="mb-3 text-muted-foreground">{icon}</div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TaskActions({ task }: { task: Task }) {
  const { openEdit, deleteTask, updateTask } = useTasks();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label={`Actions for ${task.title}`} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openEdit(task)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
          {STATUSES.filter((s) => s !== task.status).map((s) => (
            <DropdownMenuItem key={s} onClick={() => updateTask(task.id, { status: s })}>
              Move to {STATUS_LABEL[s]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => setConfirm(true)}>
            <Trash2 className="mr-2 h-4 w-4" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>"{task.title}" will be removed permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTask(task.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function TaskRow({ task }: { task: Task }) {
  const { updateTask, openEdit } = useTasks();
  const done = task.status === "done";
  return (
    <div className="group flex items-start gap-3 rounded-xl border bg-card p-4 shadow-soft transition hover:shadow-lift">
      <button
        aria-label={done ? "Mark as not done" : "Mark as done"}
        onClick={() => updateTask(task.id, { status: done ? "todo" : "done" })}
        className="mt-0.5 text-muted-foreground hover:text-primary"
      >
        {done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
      </button>
      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openEdit(task)}>
        <p className={cn("font-medium", done && "text-muted-foreground line-through")}>{task.title}</p>
        {task.description && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <PriorityBadge p={task.priority} />
          <StatusBadge s={task.status} />
          <DueDate task={task} />
          {task.tags.map((t) => <span key={t} className="text-xs text-muted-foreground">#{t}</span>)}
        </div>
      </div>
      <TaskActions task={task} />
    </div>
  );
}

export function TaskCard({ task, draggable }: { task: Task; draggable?: boolean }) {
  const { openEdit } = useTasks();
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
      className="cursor-grab rounded-xl border bg-card p-3 shadow-soft transition hover:shadow-lift active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <button className="text-left text-sm font-medium hover:text-primary" onClick={() => openEdit(task)}>{task.title}</button>
        <TaskActions task={task} />
      </div>
      {task.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PriorityBadge p={task.priority} />
        <DueDate task={task} />
      </div>
    </div>
  );
}
