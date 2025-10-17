export type TTodo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};
export type TFilter = "all" | "active" | "done";

export type TState = {
  todos: TTodo[];
  filter: TFilter;
  query: string;
};

export type TAction =
  | { type: "ADD_TODO"; title: string }
  | { type: "TOGGLE_TODO"; id: string }
  | { type: "EDIT_TODO"; id: string; title: string }
  | { type: "REMOVE_TODO"; id: string }
  | { type: "SET_FILTER"; filter: TFilter }
  | { type: "SET_QUERY"; query: string };
