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
