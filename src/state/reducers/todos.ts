import type { TAction, TState } from "@/types/todos";
import { nanoid } from "nanoid";

export const initialState: TState = { todos: [], filter: "all", query: "" };

export function reducer(state: TState, action: TAction): TState {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [
          {
            id: nanoid(),
            title: action.title,
            done: false,
            createdAt: Date.now(),
          },
          ...state.todos,
        ],
      };
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
