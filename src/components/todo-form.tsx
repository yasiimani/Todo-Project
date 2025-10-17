// src/components/todo-form.tsx
import type { TAction } from "@/types/todos";
import { useRef, type Dispatch, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
