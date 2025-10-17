عالیه! برات یه «پلن تدریس + تسک‌بندی» مرحله‌به‌مرحله آماده کردم که شاگردها از صفر تا خروجی نهایی رو با **React + TailwindCSS + shadcn/ui** بسازن. هر جلسه: پیش‌نیازها، کارگاه مرحله‌ای، چک‌لیست تحویل، و چالش خانگی. سعی کردم همه‌ی قطعات (reducer، context، localStorage، ref‌ها، فیلتر/جست‌وجو، UX) رو مرتب به هم قلاب کنم.

---

# فاز ۱ — Todo پیشرفته با shadcn/ui + Tailwind

## پیش‌نیاز کلی دوره (۱۵–۲۰ دقیقه پیش از جلسه ۱)

1. ایجاد پروژه (Next.js App Router پیشنهاد می‌شه چون shadcn/ui بومی پشتیبانی می‌کنه):

```bash
npx create-next-app@latest todo-pro --typescript --eslint
cd todo-pro
```

2. نصب Tailwind:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. پیکربندی Tailwind (`tailwind.config.ts`):

- فعال‌سازی مسیرهای app و components:

```ts
content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"];
```

- اضافه‌کردن **shadcn/ui preset** بعداً توسط نصب shadcn انجام می‌شه.

4. نصب shadcn/ui:

```bash
npx shadcn@latest init
# بعد:
npx shadcn@latest add button input checkbox switch card scroll-area dialog alert-dialog badge separator toast
```

5. سبک پایه‌ی global (`app/globals.css`): درج `@tailwind base; @tailwind components; @tailwind utilities;`

> نکته: shadcn/ui کامپوننت‌ها را به فولدر `components/ui/*` اضافه می‌کند. تم روشن/تاریک را با class `dark` روی `<html>` یا با provider خودت مدیریت می‌کنیم.

---

## جلسه 1 — راه‌اندازی و اسکلت

**خروجی نهایی جلسه:** نمایش لیست کارها + فرم افزودن.
**مدت:** 90–120 دقیقه

### قبل از کدنویسی (۱۰ دقیقه)

- مرور معماری: الگوی **state → UI** با `useReducer` در ریشه‌ی اپ.
- ساختار پوشه‌ها:

```
app/page.tsx
components/App.tsx
components/todo/TodoForm.tsx
components/todo/TodoList.tsx
components/todo/TodoItem.tsx
lib/todos/reducer.ts
lib/todos/types.ts
```

### گام‌های کارگاهی

1. **تعریف انواع و استیت:**
   `lib/todos/types.ts`

```ts
export type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};
export type Filter = "all" | "active" | "done";

export type State = {
  todos: Todo[];
  filter: Filter;
  query: string; // برای جلسه ۳ استفاده می‌شه
};

export type Action =
  | { type: "ADD_TODO"; title: string }
  | { type: "TOGGLE_TODO"; id: string }
  | { type: "EDIT_TODO"; id: string; title: string }
  | { type: "REMOVE_TODO"; id: string }
  | { type: "SET_FILTER"; filter: Filter }
  | { type: "SET_QUERY"; query: string };
```

2. **Reducer اسکلت:**
   `lib/todos/reducer.ts`

```ts
import { Action, State } from "./types";
import { nanoid } from "nanoid"; // npm i nanoid

export const initialState: State = { todos: [], filter: "all", query: "" };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TODO":
      if (!action.title.trim()) return state; // جلوگیری از آیتم خالی (چالش خانگی تکمیلش می‌شه)
      return {
        ...state,
        todos: [
          {
            id: nanoid(),
            title: action.title.trim(),
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
```

3. **App و Provider ساده با useReducer:**
   `components/App.tsx`

```tsx
"use client";
import { useReducer } from "react";
import { reducer, initialState } from "@/lib/todos/reducer";
import TodoForm from "./todo/TodoForm";
import TodoList from "./todo/TodoList";
import { Card } from "@/components/ui/card";

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <main className="mx-auto max-w-xl p-4">
      <Card className="p-4 space-y-4">
        <TodoForm dispatch={dispatch} />
        <TodoList state={state} dispatch={dispatch} />
      </Card>
    </main>
  );
}
```

4. **فرم افزودن با shadcn/ui:**
   `components/todo/TodoForm.tsx`

```tsx
import { FormEvent, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TodoForm({ dispatch }: { dispatch: any }) {
  const ref = useRef<HTMLInputElement>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = ref.current?.value ?? "";
    dispatch({ type: "ADD_TODO", title: v });
    if (ref.current) ref.current.value = "";
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input ref={ref} placeholder="چی کار داری؟" />
      <Button type="submit">افزودن</Button>
    </form>
  );
}
```

5. **لیست و آیتم:**
   `components/todo/TodoList.tsx`

```tsx
import { State } from "@/lib/todos/types";
import TodoItem from "./TodoItem";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TodoList({
  state,
  dispatch,
}: {
  state: State;
  dispatch: any;
}) {
  return (
    <ScrollArea className="max-h-[60vh] pr-3">
      <ul className="space-y-2">
        {state.todos.map((t) => (
          <TodoItem key={t.id} todo={t} dispatch={dispatch} />
        ))}
      </ul>
    </ScrollArea>
  );
}
```

`components/todo/TodoItem.tsx`

```tsx
import { Todo } from "@/lib/todos/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function TodoItem({
  todo,
  dispatch,
}: {
  todo: Todo;
  dispatch: any;
}) {
  return (
    <li className="flex items-center gap-3 justify-between rounded-md border p-2">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={todo.done}
          onCheckedChange={() => dispatch({ type: "TOGGLE_TODO", id: todo.id })}
        />
        <span className={todo.done ? "line-through opacity-60" : ""}>
          {todo.title}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            const title = prompt("ویرایش عنوان:", todo.title) ?? todo.title;
            dispatch({ type: "EDIT_TODO", id: todo.id, title });
          }}
        >
          ویرایش
        </Button>
        <Button
          variant="destructive"
          onClick={() => dispatch({ type: "REMOVE_TODO", id: todo.id })}
        >
          حذف
        </Button>
      </div>
    </li>
  );
}
```

### چک‌لیست تحویل جلسه ۱

- [ ] CRUD پایه (افزودن/حذف/تغییر وضعیت/ویرایش) کار می‌کند.
- [ ] هیچ آیتم خالی به لیست اضافه نشود.
- [ ] کنسول React بدون warning.

### چالش خانگی جلسه ۱

- **اعتبارسنجی ورودی:** اگر ورودی خالی بود، `toast` خطا نشان بده (از shadcn/ui toast).
- Trim و محدودیت طول (مثلاً 100 کاراکتر).

---

## جلسه 2 — Context + Ref + Persist

**خروجی نهایی:** تم روشن/تاریک + ذخیره در `localStorage` + فوکوس خودکار بعد از افزودن.
**مدت:** 90 دقیقه

### گام‌های کارگاهی

1. **ThemeContext + toggle:**

- بساز: `contexts/ThemeContext.tsx`

```tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return (
    <ThemeCtx.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}
export const useTheme = () => useContext(ThemeCtx);
```

- در `app/layout.tsx`، `ThemeProvider` را دور children بپیچ.

- دکمه‌ی تغییر تم در `App.tsx`:

```tsx
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const { theme, toggle } = useTheme();
// ...
<div className="flex items-center justify-between">
  <span className="text-sm opacity-70">Theme</span>
  <Switch checked={theme==='dark'} onCheckedChange={toggle} />
</div>
<Separator />
```

2. **Persist با localStorage:**

- ساخت یک لایه‌ی sync: `lib/todos/storage.ts`

```ts
import { State } from "./types";
const KEY = "todos:v1";
export const loadState = (): State | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
};
export const saveState = (s: State) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
};
```

- در `App.tsx`:

```tsx
import { useEffect } from "react";
import { loadState, saveState } from "@/lib/todos/storage";

// init با load-once
const [state, dispatch] = useReducer(
  reducer,
  initialState,
  () => loadState() ?? initialState
);

// save-on-change
useEffect(() => {
  saveState(state);
}, [state]);
```

3. **useRef برای فوکوس خودکار بعد از افزودن:**

- در `TodoForm`, ref را دارید؛ بعد از `dispatch(ADD_TODO)`:

```tsx
if (ref.current) ref.current.focus();
```

### چالش خانگی جلسه ۲ (debounce ذخیره‌سازی)

- به‌جای `saveState(state)` مستقیم، داخل `useEffect`:

```tsx
useEffect(() => {
  const id = setTimeout(() => saveState(state), 300);
  return () => clearTimeout(id);
}, [state]);
```

- توضیح cleanup و جلوگیری از write زیاد.

### چک‌لیست تحویل جلسه ۲

- [ ] تم روشن/تاریک با `Switch`.
- [ ] رفرش صفحه داده‌ها را نگه می‌دارد.
- [ ] بعد از افزودن، Input فوکوس می‌گیرد.

---

## جلسه 3 — فیلتر/جست‌وجو + UX

**خروجی نهایی:** فیلتر (All / Active / Done) + جست‌وجو + اسکرول نرم به آیتم ویرایش‌شده.
**مدت:** 90–120 دقیقه

### گام‌های کارگاهی

1. **کنترل‌های فیلتر و جست‌وجو در هدر `App`:**

```tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

<div className="flex flex-wrap items-center gap-2">
  <Input
    placeholder="جست‌وجو..."
    onChange={(e) => dispatch({ type: "SET_QUERY", query: e.target.value })}
  />
  <div className="flex gap-1">
    {(["all", "active", "done"] as const).map((f) => (
      <Button
        key={f}
        size="sm"
        variant="outline"
        onClick={() => dispatch({ type: "SET_FILTER", filter: f })}
      >
        {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
      </Button>
    ))}
  </div>
</div>;
```

2. **memoization سبک (مشتق‌سازی لیست برای نمایش):**

- در `TodoList` محاسبه‌ی مشتق‌شده:

```tsx
const filtered = state.todos
  .filter((t) => {
    if (state.filter === "active") return !t.done;
    if (state.filter === "done") return t.done;
    return true;
  })
  .filter((t) =>
    state.query.trim()
      ? t.title.toLowerCase().includes(state.query.toLowerCase())
      : true
  );
```

- (اختیاری) اگر لیست بزرگ شد، `useMemo` روی `state.todos`, `state.filter`, `state.query`.

3. **اسکرول نرم به آیتم ویرایش‌شده با useRef:**

- در `TodoItem` یک `ref` بگذار و هنگام ویرایش موفق `scrollIntoView({ behavior: 'smooth', block: 'center' })`.

4. **UX: تایید حذف با `AlertDialog` shadcn/ui**

- دکمه حذف را به دیالوگ تایید وصل کن.

5. **Toastها** برای بازخورد افزوده/ویرایش/حذف (shadcn/ui toast provider).

### چالش خانگی جلسه ۳

- **انیمیشن ورود/خروج آیتم‌ها:** با Tailwind + CSS transitions

  - کلاس‌های: `transition-all`, `duration-300`, `opacity-0` → `opacity-100`, translate-y.
  - هنگام mount/unmount می‌تونی از keyهای متفاوت یا یک wrapper با کلاس‌های حالت‌دار استفاده کنی.

### چک‌لیست تحویل جلسه ۳

- [ ] فیلتر سه‌حالته + جست‌وجو کار می‌کنند.
- [ ] اسکرول نرم بعد از ویرایش.
- [ ] انیمیشن ساده‌ی ورود/خروج آیتم‌ها.

---

## مپ کردن به کامپوننت‌های shadcn/ui (راهنمای سریع)

- **Form:** `Input`, `Button`
- **Item:** `Checkbox`, `Button (secondary/destructive)`
- **Container/Layout:** `Card`, `ScrollArea`, `Separator`
- **Theme:** `Switch`
- **Feedback:** `Toast`, `AlertDialog`
- **Meta:** `Badge` برای شمارنده‌ها (مثلاً Active count)

---

## معیار قبولی فاز ۱ (روبه‌روی دانشجوها روی وایت‌بورد)

- CRUD کامل بدون خطای کنسول
- تم روشن/تاریک پایدار (persist)
- sync با `localStorage` (load-once + save-on-change + debounce)
- جست‌وجو/فیلتر دقیق
- UX: فوکوس بعد از افزودن، تاییدیه حذف، اسکرول نرم، انیمیشن‌های سبک

---

## نکات مربی‌گری و خطاهای رایج

- **هیدراسیون Next.js:** دسترسی به `window/localStorage` فقط در کلاینت (از `use client` و initializer سوم `useReducer` استفاده کنید).
- **کلیدهای لیست:** همیشه `key={todo.id}`؛ از index استفاده نکنید.
- **عدم جهش state:** فقط با کپی immutable در reducer.
- **Toast Provider:** فراموش نشه در `app/layout.tsx` قرار بگیره.
- **Dark class:** روی `<html>` سوییچ می‌شه؛ Tailwind باید حالت `dark` رو روی `class` تنظیم کرده باشه.

---

## تمرین پایانی اختیاری (برای +۱ نمره)

- **Edit بهتر:** ویرایش inline با `Input` داخل آیتم + تایید با Enter/ESC.
- **Empty state:** وقتی لیست خالیه، یک Card با پیام خالی و لینک «افزودن اولین کار».
- **Export/Import JSON:** دکمه‌هایی برای دانلود/آپلود لیست تسک‌ها.

اگر دوست داری، می‌تونم نسخه‌ی پایه‌ی پروژه (اسکلت فایل‌ها + reducer + UI خام) رو هم بهت بدَم تا به شاگردها بدی.
