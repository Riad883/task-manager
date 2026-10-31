<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All task reads/writes go through `src/services/taskService.ts` (localStorage now, Axios REST when `VITE_API_URL` is set) — so a future Express/MongoDB backend needs no UI changes.
- Task state lives in `TasksProvider` (`src/hooks/use-tasks.tsx`), mounted in `__root.tsx`; storage is read in `useEffect` to avoid SSR hydration mismatches.
- Pure task logic (types, zod validation, filtering, stats) lives in `src/lib/tasks.ts` and is unit-tested.
