import { useEffect, useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import {
  PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL, taskInputSchema, type TaskInput,
} from "@/lib/tasks";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY: TaskInput = { title: "", description: "", status: "todo", priority: "medium", dueDate: "", tags: [] };

export function TaskFormDialog() {
  const { formOpen, closeForm, editing, defaults, createTask, updateTask } = useTasks();
  const [values, setValues] = useState<TaskInput>(EMPTY);
  const [tagText, setTagText] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof TaskInput, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!formOpen) return;
    const v = editing
      ? { title: editing.title, description: editing.description, status: editing.status, priority: editing.priority, dueDate: editing.dueDate, tags: editing.tags }
      : { ...EMPTY, ...defaults };
    setValues(v);
    setTagText(v.tags.join(", "));
    setErrors({});
  }, [formOpen, editing, defaults]);

  const set = <K extends keyof TaskInput>(k: K, v: TaskInput[K]) => setValues((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagText.split(",").map((t) => t.trim()).filter(Boolean);
    const parsed = taskInputSchema.safeParse({ ...values, tags });
    if (!parsed.success) {
      const errs: Partial<Record<keyof TaskInput, string>> = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as keyof TaskInput] ??= issue.message;
      setErrors(errs);
      return;
    }
    setSaving(true);
    if (editing) await updateTask(editing.id, parsed.data);
    else await createTask(parsed.data);
    setSaving(false);
    closeForm();
  }

  return (
    <Dialog open={formOpen} onOpenChange={(o) => !o && closeForm()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{editing ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Title" error={errors.title} id="title">
            <Input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="What needs doing?" autoFocus />
          </Field>
          <Field label="Description" error={errors.description} id="description">
            <Textarea id="description" rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional details" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status" id="status">
              <Select value={values.status} onValueChange={(v) => set("status", v as TaskInput["status"])}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Priority" id="priority">
              <Select value={values.priority} onValueChange={(v) => set("priority", v as TaskInput["priority"])}>
                <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due date" error={errors.dueDate} id="dueDate">
              <Input id="dueDate" type="date" value={values.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </Field>
            <Field label="Tags (comma separated)" error={errors.tags} id="tags">
              <Input id="tags" value={tagText} onChange={(e) => setTagText(e.target.value)} placeholder="dev, docs" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={saving}>{editing ? "Save changes" : "Create task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, id, children }: { label: string; error?: string | undefined; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}
