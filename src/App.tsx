// src/App.tsx
import { useEffect, useMemo, useReducer } from "react";
import { initialState, reducer } from "./state/reducers/todos";
import type { TState, TFilter } from "./types/todos";
import { Card } from "./components/ui/card";
import TodoForm from "./components/todo-form";
import TodoList from "./components/todo-list";
import { Separator } from "./components/ui/separator";
import { Badge } from "./components/ui/badge";

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
