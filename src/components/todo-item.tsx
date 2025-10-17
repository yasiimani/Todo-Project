// src/components/todo-item.tsx
import type { TAction, TTodo } from "@/types/todos";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Dispatch } from "react";
import { toast } from "sonner";

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
