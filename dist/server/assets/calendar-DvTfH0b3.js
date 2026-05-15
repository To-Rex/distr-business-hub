import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { n as cn, r as buttonVariants, B as Button, a as useSettings, P as PageHeader, C as Card, o as CardHeader, p as CardTitle, g as CardContent, h as Badge, I as Input } from "./router-CTVAwSR8.js";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, CalendarDays, Plus, Trash2 } from "lucide-react";
import { getDefaultClassNames, DayPicker } from "react-day-picker";
import { T as Textarea } from "./textarea-BmcP_vmP.js";
import "@tanstack/react-router";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: ({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsx("div", { "data-slot": "calendar", ref: rootRef, className: cn(className2), ...props2 });
        },
        Chevron: ({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsx(ChevronLeftIcon, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsx(ChevronRightIcon, { className: cn("size-4", className2), ...props2 });
          }
          return /* @__PURE__ */ jsx(ChevronDownIcon, { className: cn("size-4", className2), ...props2 });
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props2 }) => {
          return /* @__PURE__ */ jsx("td", { ...props2, children: /* @__PURE__ */ jsx("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
        },
        ...components
      },
      ...props
    }
  );
}
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsx(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}
const STORAGE_KEY = "calendar-notes-v1";
function dateKey(date) {
  return date.toISOString().slice(0, 10);
}
function CalendarPage() {
  const {
    t,
    lang
  } = useSettings();
  const [selectedDate, setSelectedDate] = useState(/* @__PURE__ */ new Date());
  const [currentMonth, setCurrentMonth] = useState(/* @__PURE__ */ new Date());
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [notesByDay, setNotesByDay] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setNotesByDay(parsed);
      }
    } catch {
      setNotesByDay({});
    } finally {
      setIsHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notesByDay));
  }, [isHydrated, notesByDay]);
  const selectedKey = dateKey(selectedDate);
  const selectedDayNotes = notesByDay[selectedKey] ?? [];
  const monthName = currentMonth.toLocaleString(void 0, {
    month: "long",
    year: "numeric"
  });
  const monthPrefix = currentMonth.toISOString().slice(0, 7);
  const totalNotesInMonth = Object.entries(notesByDay).reduce((sum, [day, entries]) => {
    if (!day.startsWith(monthPrefix)) return sum;
    return sum + entries.length;
  }, 0);
  const daysWithNotes = useMemo(() => Object.entries(notesByDay).filter(([, entries]) => entries.length > 0).map(([day]) => /* @__PURE__ */ new Date(`${day}T12:00:00`)), [notesByDay]);
  const monthPreview = useMemo(() => Object.entries(notesByDay).filter(([day, entries]) => day.startsWith(monthPrefix) && entries.length > 0).sort(([a], [b]) => a > b ? 1 : -1).slice(0, 6), [monthPrefix, notesByDay]);
  const addNote = () => {
    const cleanTitle = title.trim();
    const cleanNote = note.trim();
    if (!cleanTitle && !cleanNote) return;
    const newNote = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title: cleanTitle || t("calendarUntitledNote"),
      note: cleanNote,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setNotesByDay((prev) => ({
      ...prev,
      [selectedKey]: [newNote, ...prev[selectedKey] ?? []]
    }));
    setTitle("");
    setNote("");
  };
  const removeNote = (id) => {
    setNotesByDay((prev) => {
      const nextDay = (prev[selectedKey] ?? []).filter((item) => item.id !== id);
      if (nextDay.length === 0) {
        const {
          [selectedKey]: _removed,
          ...rest
        } = prev;
        return rest;
      }
      return {
        ...prev,
        [selectedKey]: nextDay
      };
    });
  };
  const clearSelectedDay = () => {
    setNotesByDay((prev) => {
      const {
        [selectedKey]: _removed,
        ...rest
      } = prev;
      return rest;
    });
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: t("calendar"), description: t("calendarDesc") }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-base capitalize", children: monthName }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsx(CalendarDays, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxs("span", { children: [
              Object.keys(notesByDay).length,
              " ",
              t("calendarActiveDays")
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Calendar, { mode: "single", selected: selectedDate, onSelect: (next) => next && setSelectedDate(next), month: currentMonth, onMonthChange: setCurrentMonth, modifiers: {
          hasNotes: daysWithNotes
        }, modifiersClassNames: {
          hasNotes: "bg-primary/10 text-primary font-semibold rounded-md"
        }, className: "w-full rounded-xl border bg-card p-3" }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: t("calendarDailyNotes") }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: selectedDate.toLocaleDateString(lang) }),
              /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
                selectedDayNotes.length,
                " ",
                t("calendarNotesCount")
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2", children: [
              /* @__PURE__ */ jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: t("calendarTitle"), maxLength: 80 }),
              /* @__PURE__ */ jsx(Textarea, { value: note, onChange: (e) => setNote(e.target.value), placeholder: t("calendarWriteNote"), className: "min-h-[90px]" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs(Button, { onClick: addNote, size: "sm", className: "gap-1.5", children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                  t("save")
                ] }),
                /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedDate(/* @__PURE__ */ new Date()), children: t("today") }),
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", disabled: selectedDayNotes.length === 0, onClick: clearSelectedDay, children: t("calendarClearDay") })
              ] })
            ] })
          ] }),
          selectedDayNotes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("calendarNoNotesForDay") }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: selectedDayNotes.map((item) => /* @__PURE__ */ jsx("div", { className: "rounded-lg border p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: item.title }),
              item.note && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1 whitespace-pre-wrap", children: item.note }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2", children: new Date(item.createdAt).toLocaleTimeString(lang, {
                hour: "2-digit",
                minute: "2-digit"
              }) })
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => removeNote(item.id), "aria-label": t("calendarDeleteNote"), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] }) }, item.id)) }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-3 space-y-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: t("upcoming") }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              totalNotesInMonth,
              " ",
              t("calendarNotesInMonth")
            ] }),
            monthPreview.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("noEvents") }) : monthPreview.map(([day, entries]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { children: (/* @__PURE__ */ new Date(`${day}T12:00:00`)).toLocaleDateString(lang) }),
              /* @__PURE__ */ jsx(Badge, { variant: "outline", children: entries.length })
            ] }, day))
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  CalendarPage as component
};
