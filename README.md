# Phase 1 — Advanced Todo App with shadcn/ui + Tailwind

This README is your hands-on workshop package. It includes working code (TypeScript + React), inline comments, and short explanations for each block. Copy files as-is, then advance session by session.

> **Package manager:** uses **Bun** in all commands.
> **UI kit:** shadcn/ui components under `components/ui/*`.

---

## 0) Install dependencies & shadcn/ui

```bash
# Add shadcn/ui components you’ll need in Phase 1
bunx --bun shadcn@latest add button input checkbox switch card scroll-area dialog alert-dialog badge separator sonner

# Also add nanoid for id generation
bun add nanoid
```
---

## 1) Folder structure

```
src/App.tsx
src/components/todo-form.tsx
src/components/todo-list.tsx
src/components/todo-item.tsx
src/lib/storage.ts
src/state/reducers/todos.ts
src/types/todos.ts
```

---

## 2) Types & State — `src/types/todos.ts`

**What & why:** Centralizes shared types (todo item, filter, reducer’s state/actions) to prevent drift and improve maintainability.

```ts
// src/types/todos.ts
export type TTodo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number; // epoch ms for sorting/analytics
};

export type TFilter = "all" | "active" | "done";

export type TState = {
  todos: TTodo[];
  filter: TFilter;
  query: string; // used for search
};

export type TAction =
  | { type: "ADD_TODO"; title: string }
  | { type: "TOGGLE_TODO"; id: string }
  | { type: "EDIT_TODO"; id: string; title: string }
  | { type: "REMOVE_TODO"; id: string }
  | { type: "SET_FILTER"; filter: TFilter }
  | { type: "SET_QUERY"; query: string };
```

---

## 3) Reducer — `src/state/reducers/todos.ts`

**What & why:** A pure reducer with **immutable** updates keeps business logic predictable, easy to test, and scalable.

```ts
// src/state/reducers/todos.ts
import type { TAction, TState, TTodo } from "@/types/todos";
import { nanoid } from "nanoid";

export const initialState: TState = { todos: [], filter: "all", query: "" };

export function reducer(state: TState, action: TAction): TState {
  switch (action.type) {
    case "ADD_TODO": {
      const title = action.title.trim();
      if (!title) return state; // guard: no empty todos
      const next: TTodo = {
        id: nanoid(),
        title,
        done: false,
        createdAt: Date.now(),
      };
      return { ...state, todos: [next, ...state.todos] };
    }

    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t
        ),
      };

    case "EDIT_TODO":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, title: action.title } : t
        ),
      };

    case "REMOVE_TODO":
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };

    case "SET_FILTER":
      return { ...state, filter: action.filter };

    case "SET_QUERY":
      return { ...state, query: action.query };

    default:
      return state;
  }
}
```

**Key choices:**

- Prevent empty todos.
- Prepend new items so recent tasks appear on top.
- Zero mutations; always return new arrays/objects.

---

## 4) Local persistence helpers — `src/lib/storage.ts`

**What & why:** Encapsulates LocalStorage I/O, keeps components clean, makes it testable.

```ts
// src/lib/storage.ts
import type { TState } from "@/types/todos";

const KEY = "todos:v1";

export const loadState = (): TState | null => {
  if (typeof window === "undefined") return null; // SSR safety
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
};

export const saveState = (s: TState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
};
```

---

## 5) App shell — `src/App.tsx`

**What & why:** Hosts the reducer, wires persistence, provides layout, and renders Form + List. Also mounts Sonner `<Toaster />` for toasts.

```tsx
// src/App.tsx
import { useEffect, useMemo, useReducer } from "react";
import { initialState, reducer } from "./state/reducers/todos";
import type { TAction, TState, TFilter } from "./types/todos";
import { Card } from "./components/ui/card";
import TodoForm from "./components/todo-form";
import TodoList from "./components/todo-list";
import { Separator } from "./components/ui/separator";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/sonner"; // shadcn sonner export
import { loadState, saveState } from "./lib/storage";

// Debounce helper to avoid frequent writes
function useDebouncedSave(state: TState, delay = 300) {
  useEffect(() => {
    const t = setTimeout(() => saveState(state), delay);
    return () => clearTimeout(t);
  }, [state, delay]);
}

export default function App() {
  // Hydrate from LocalStorage (once)
  const bootState = useMemo(() => loadState() ?? initialState, []);
  const [state, dispatch] = useReducer(reducer, bootState);

  // Persist with debounce
  useDebouncedSave(state);

  // Derived counts for UI badges
  const active = state.todos.filter((t) => !t.done).length;
  const done = state.todos.length - active;

  const setFilter = (f: TFilter) => dispatch({ type: "SET_FILTER", filter: f });

  return (
    <main className="mx-auto max-w-xl p-4">
      {/* Sonner toaster (Vite/CRA). If Next.js App Router, put <Toaster/> in app/layout.tsx */}
      <Toaster />

      <Card className="p-4 space-y-4">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Advanced Todo</h1>
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Badge variant="secondary">All: {state.todos.length}</Badge>
            <Badge variant="secondary">Active: {active}</Badge>
            <Badge variant="secondary">Done: {done}</Badge>
          </div>
          <Separator />
        </header>

        <TodoForm dispatch={dispatch} />

        {/* Filters & search (Session 3). Keep here for a compact header */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`px-3 py-1 rounded-md border ${
              state.filter === "all" ? "bg-muted" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-md border ${
              state.filter === "active" ? "bg-muted" : ""
            }`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={`px-3 py-1 rounded-md border ${
              state.filter === "done" ? "bg-muted" : ""
            }`}
            onClick={() => setFilter("done")}
          >
            Done
          </button>

          <input
            placeholder="Search…"
            className="ml-auto w-40 px-3 py-1 rounded-md border"
            value={state.query}
            onChange={(e) =>
              dispatch({ type: "SET_QUERY", query: e.currentTarget.value })
            }
          />
        </div>

        <TodoList state={state} dispatch={dispatch} />
      </Card>
    </main>
  );
}
```

**Why these choices:**

- Loads once from LocalStorage to avoid SSR/hydration issues.
- Debounced persistence prevents noisy writes.
- Keeps filter/query controls close to the list for a focused UX.

---

## 6) Add form — `src/components/todo-form.tsx`

**What & why:** Minimal, keyboard-first form. Uses `ref` for instant reset/focus. Shows toast for validation (Session 1 homework integrated).

```tsx
// src/components/todo-form.tsx
import type { TAction } from "@/types/todos";
import { useRef, type Dispatch, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const MAX_LEN = 100;

export default function TodoForm({
  dispatch,
}: {
  dispatch: Dispatch<TAction>;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = ref.current?.value ?? "";
    const title = v.trim();
    if (!title) {
      toast.error("Title can’t be empty");
      return;
    }
    if (title.length > MAX_LEN) {
      toast.error(`Max ${MAX_LEN} characters`);
      return;
    }

    dispatch({ type: "ADD_TODO", title });
    if (ref.current) {
      ref.current.value = ""; // clear
      ref.current.focus(); // auto-focus (Session 2)
    }
    toast.success("Todo added");
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input ref={ref} placeholder="What’s on your mind?" />
      <Button type="submit">Add</Button>
    </form>
  );
}
```

---

## 7) List & Item — `src/components/todo-list.tsx` + `src/components/todo-item.tsx`

**What & why:** `TodoList` handles filtering + searching, and renders to a scrollable area. `TodoItem` focuses on single-item interactions and UX feedback.

```tsx
// src/components/todo-list.tsx
import type { TAction, TState, TTodo } from "@/types/todos";
import TodoItem from "./todo-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Dispatch } from "react";

function applyFilterAndSearch(todos: TTodo[], state: TState) {
  let rows = todos;
  // filter
  if (state.filter === "active") rows = rows.filter((t) => !t.done);
  if (state.filter === "done") rows = rows.filter((t) => t.done);
  // search
  const q = state.query.trim().toLowerCase();
  if (q) rows = rows.filter((t) => t.title.toLowerCase().includes(q));
  return rows;
}

export default function TodoList({
  state,
  dispatch,
}: {
  state: TState;
  dispatch: Dispatch<TAction>;
}) {
  const rows = applyFilterAndSearch(state.todos, state);

  return (
    <ScrollArea className="h-96 pr-3">
      {rows.length === 0 ? (
        <p className="text-sm opacity-70 p-2">
          No items. Add your first task ✨
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((t) => (
            <TodoItem key={t.id} todo={t} dispatch={dispatch} />
          ))}
        </ul>
      )}
    </ScrollArea>
  );
}
```

```tsx
// src/components/todo-item.tsx
import type { TAction, TTodo } from "@/types/todos";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Dispatch } from "react";
import { toast } from "@/components/ui/sonner";

export default function TodoItem({
  todo,
  dispatch,
}: {
  todo: TTodo;
  dispatch: Dispatch<TAction>;
}) {
  const onToggle = () => {
    dispatch({ type: "TOGGLE_TODO", id: todo.id });
  };

  const onEdit = () => {
    const title = prompt("Edit title:", todo.title) ?? todo.title; // simple inline edit
    if (title.trim() !== todo.title.trim()) {
      dispatch({ type: "EDIT_TODO", id: todo.id, title: title.trim() });
      toast.success("Todo updated");
      // Smooth scroll to the edited item
      document
        .getElementById(todo.id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const onDelete = () => {
    dispatch({ type: "REMOVE_TODO", id: todo.id });
    toast("Todo deleted");
  };

  return (
    <li
      id={todo.id}
      className="flex items-center gap-3 justify-between rounded-md border p-2 transition-all"
    >
      <div className="flex items-center gap-3">
        <Checkbox checked={todo.done} onCheckedChange={onToggle} />
        <span className={todo.done ? "line-through opacity-60" : ""}>
          {todo.title}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onEdit}>
          Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this todo?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}
```

**Why these choices:**

- `AlertDialog` prevents accidental deletions.
- `scrollIntoView` helps users keep context after edits.
- Lightweight inline edit avoids extra component state for Phase 1.

---

## 8) Session checklists & homework

### Session 1 — Setup & Skeleton

**Final output:** Display todo list + add form.

- [x] Basic CRUD (add/remove/toggle/edit) works.
- [x] No empty item is added.
- [x] React console is warning-free.

**Homework:**

- Validation toast for empty input (implemented in `TodoForm`).
- Trim and enforce max length (implemented).

---

### Session 2 — Ref + Persistence

**Final output:** LocalStorage persistence + auto-focus after add.

- [x] Persist with LocalStorage (`lib/storage.ts`).
- [x] Debounced save via `useDebouncedSave` in `App.tsx`.
- [x] Auto-focus after add (in `TodoForm`).

**Homework:**

- Already included: debounced save.

---

### Session 3 — Filters / Search + UX

**Final output:** Filter (All / Active / Done) + Search + smooth scroll + confirm delete + toasts.

- [x] Filter + search implemented in `TodoList`.
- [x] Smooth scroll to edited item in `TodoItem`.
- [x] `AlertDialog` confirm on delete.
- [x] Toast feedback for actions.
- [ ] **Stretch:** Animate item entry/exit with Tailwind (`transition`, `opacity`, `translate-y` classes or Framer Motion).

**Hint for simple animations:**

- Add `transition`, `duration-200`, and conditional `opacity-0`/`opacity-100` classes when mounting/unmounting with a small key-based trick, or switch to Framer Motion `AnimatePresence` for more control.

---

## 9) Mapping to shadcn/ui components (quick reference)

- **Form:** `Input`, `Button`
- **Item:** `Checkbox`, `Button (secondary/destructive)`
- **Layout:** `Card`, `ScrollArea`, `Separator`
- **Feedback:** `sonner` (`toast`, `<Toaster />`), `AlertDialog`
- **Meta:** `Badge` for counters (active/done counts)

---

## 10) Acceptance criteria for Phase 1 (live demo)

- Full CRUD with no console errors.
- LocalStorage load + debounced save.
- Accurate search/filter.
- UX niceties: auto-focus, confirm delete, smooth scroll, basic animations (optional).

---

## 11) Teaching notes & common pitfalls

- **SSR safety:** Only access `window/localStorage` on the client.
- **Keys:** always `key={todo.id}`, never array index.
- **Reducer purity:** don’t mutate arrays/objects.
- **Toast provider:**

  - **Next.js**: add `<Toaster />` to `app/layout.tsx`.
  - **Vite/CRA**: render `<Toaster />` once in `App.tsx`.

---

## 12) Optional final challenge (+1 grade)

- Inline edit with editable `<Input>` and Enter/ESC handling.
- Empty state card with “Add your first task”.
- Export/Import JSON of tasks (download/upload file).

**Export/Import sketch:**

```ts
// Export: create a Blob(JSON.stringify(state.todos)) and download via <a download>
// Import: <input type="file" accept="application/json">, parse JSON, dispatch add/replace
```
