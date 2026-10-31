# TaskFlow

A task manager with a dashboard, a searchable task list, a Kanban board and a monthly calendar. Data is saved in the browser (localStorage) and the data layer can be switched to an Express.js + MongoDB REST API later.

## Features
- Dashboard: totals, in progress, completed, overdue, completion progress, tasks due soon
- Create, edit, delete tasks (with a confirmation step); mark done in one click
- Priorities (low / medium / high), statuses (to do / in progress / done), due dates, tags
- Search (title, description, tags), filter by status and priority, sort by newest, due date, priority or title
- Kanban board with drag and drop, plus a menu to move cards (works on touch screens)
- Monthly calendar; pick a day to see or add its tasks
- Form validation, loading states, empty states, error messages
- Responsive layout: sidebar on desktop, bottom navigation on mobile
- localStorage persistence (survives page refresh)

## Technologies
- React 19 + TypeScript
- TanStack Router / TanStack Start (file-based routing; replaces React Router DOM on this platform)
- Tailwind CSS v4, shadcn/ui components
- Lucide React icons
- Axios (pre-wired API client for the future backend)
- date-fns, zod, sonner
- Vite, Vitest

## Install & run locally
```bash
npm install        # or: bun install
npm run dev        # starts http://localhost:8080
npm run build      # production build
npx vitest run     # tests
```

## Connecting a backend later
`src/services/taskService.ts` is the only place that reads or writes tasks. Set `VITE_API_URL` in a `.env` file (e.g. `VITE_API_URL=http://localhost:5000/api`) and it will call:

| Method | Path | Purpose |
|---|---|---|
| GET | /tasks | list tasks |
| POST | /tasks | create task |
| PUT | /tasks/:id | update task |
| DELETE | /tasks/:id | delete task |

## Project structure
```
src/
  routes/               pages: index (dashboard), tasks, board, calendar, __root (layout)
  components/taskflow/  AppShell, TaskFormDialog, FilterBar, TaskBits (cards, badges, empty states)
  components/ui/        shadcn UI primitives
  hooks/use-tasks.tsx   task state + CRUD context
  services/taskService.ts  data access (localStorage now, Axios/REST later)
  lib/tasks.ts          types, validation, filtering, stats
  test/                 Vitest tests
  styles.css            design tokens
```
