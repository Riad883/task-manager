import axios from "axios";
import { makeSeedTasks, type Task, type TaskInput } from "@/lib/tasks";

/**
 * Task data access layer.
 * Today: browser localStorage. Later: set VITE_API_URL to an Express/MongoDB
 * REST API (GET/POST /tasks, PUT/DELETE /tasks/:id) and the same methods
 * switch to HTTP via the Axios client below — UI code does not change.
 */
const API_URL = import.meta.env["VITE_API_URL"] as string | undefined;
export const apiClient = axios.create({ ...(API_URL ? { baseURL: API_URL } : {}), timeout: 10000 });

const STORAGE_KEY = "taskflow.tasks.v1";

function read(): Task[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    const seed = makeSeedTasks();
    write(seed);
    return seed;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function write(tasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export const taskService = {
  async list(): Promise<Task[]> {
    if (API_URL) return (await apiClient.get<Task[]>("/tasks")).data;
    return read();
  },
  async create(input: TaskInput): Promise<Task> {
    if (API_URL) return (await apiClient.post<Task>("/tasks", input)).data;
    const now = new Date().toISOString();
    const task: Task = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    write([task, ...read()]);
    return task;
  },
  async update(id: string, patch: Partial<TaskInput>): Promise<Task> {
    if (API_URL) return (await apiClient.put<Task>(`/tasks/${id}`, patch)).data;
    const tasks = read();
    const i = tasks.findIndex((t) => t.id === id);
    const current = tasks[i];
    if (!current) throw new Error("Task not found");
    const next: Task = { ...current, ...patch, updatedAt: new Date().toISOString() } as Task;
    tasks[i] = next;
    write(tasks);
    return next;
  },
  async remove(id: string): Promise<void> {
    if (API_URL) {
      await apiClient.delete(`/tasks/${id}`);
      return;
    }
    write(read().filter((t) => t.id !== id));
  },
};
