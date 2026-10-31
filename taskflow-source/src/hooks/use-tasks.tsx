import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { taskService } from "@/services/taskService";
import type { Task, TaskInput } from "@/lib/tasks";

interface TasksCtx {
  tasks: Task[];
  loaded: boolean;
  error: string | null;
  createTask: (i: TaskInput) => Promise<void>;
  updateTask: (id: string, p: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // form dialog control
  formOpen: boolean;
  editing: Task | null;
  defaults: Partial<TaskInput>;
  openCreate: (defaults?: Partial<TaskInput>) => void;
  openEdit: (t: Task) => void;
  closeForm: () => void;
}

const Ctx = createContext<TasksCtx | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaults, setDefaults] = useState<Partial<TaskInput>>({});

  useEffect(() => {
    taskService
      .list()
      .then(setTasks)
      .catch(() => setError("Could not load your tasks."))
      .finally(() => setLoaded(true));
  }, []);

  const fail = (msg: string) => () => {
    toast.error(msg);
  };

  const createTask = useCallback(async (i: TaskInput) => {
    try {
      const t = await taskService.create(i);
      setTasks((prev) => [t, ...prev]);
      toast.success("Task created");
    } catch {
      fail("Could not create task")();
    }
  }, []);
  const updateTask = useCallback(async (id: string, p: Partial<TaskInput>) => {
    try {
      const t = await taskService.update(id, p);
      setTasks((prev) => prev.map((x) => (x.id === id ? t : x)));
    } catch {
      fail("Could not update task")();
    }
  }, []);
  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskService.remove(id);
      setTasks((prev) => prev.filter((x) => x.id !== id));
      toast.success("Task deleted");
    } catch {
      fail("Could not delete task")();
    }
  }, []);

  return (
    <Ctx.Provider
      value={{
        tasks, loaded, error, createTask, updateTask, deleteTask,
        formOpen, editing, defaults,
        openCreate: (d = {}) => { setEditing(null); setDefaults(d); setFormOpen(true); },
        openEdit: (t) => { setEditing(t); setDefaults({}); setFormOpen(true); },
        closeForm: () => setFormOpen(false),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTasks() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTasks must be used inside TasksProvider");
  return c;
}
