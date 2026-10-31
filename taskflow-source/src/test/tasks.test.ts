import { describe, expect, it } from "vitest";
import { filterTasks, getStats, isOverdue, taskInputSchema, DEFAULT_FILTERS, type Task } from "@/lib/tasks";

const t = (p: Partial<Task>): Task => ({ id: "1", title: "Task", description: "", status: "todo", priority: "medium", dueDate: "", tags: [], createdAt: "2026-01-01", updatedAt: "2026-01-01", ...p });
const valid = { title: "Write docs", description: "", status: "todo", priority: "low", dueDate: "", tags: [] };

describe("task rules", () => {
  it("rejects titles shorter than 3 characters", () => {
    expect(taskInputSchema.safeParse({ ...valid, title: "ab" }).success).toBe(false);
    expect(taskInputSchema.safeParse(valid).success).toBe(true);
  });
  it("search matches title, description and tags", () => {
    const list = [t({ id: "a", title: "Alpha" }), t({ id: "b", description: "beta note" }), t({ id: "c", tags: ["gamma"] })];
    expect(filterTasks(list, { ...DEFAULT_FILTERS, search: "gamma" }).map((x) => x.id)).toEqual(["c"]);
    expect(filterTasks(list, { ...DEFAULT_FILTERS, search: "beta" }).map((x) => x.id)).toEqual(["b"]);
  });
  it("filters by priority and sorts high first", () => {
    const list = [t({ id: "l", priority: "low" }), t({ id: "h", priority: "high" })];
    expect(filterTasks(list, { ...DEFAULT_FILTERS, sort: "priority" }).map((x) => x.id)).toEqual(["h", "l"]);
    expect(filterTasks(list, { ...DEFAULT_FILTERS, priority: "low" }).map((x) => x.id)).toEqual(["l"]);
  });
  it("done tasks are never overdue", () => {
    expect(isOverdue(t({ dueDate: "2026-01-01" }), "2026-02-01")).toBe(true);
    expect(isOverdue(t({ dueDate: "2026-01-01", status: "done" }), "2026-02-01")).toBe(false);
  });
  it("completion percentage", () => {
    expect(getStats([t({ status: "done" }), t({}), t({}), t({ status: "done" })]).completion).toBe(50);
  });
});
