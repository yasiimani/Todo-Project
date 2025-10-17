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
