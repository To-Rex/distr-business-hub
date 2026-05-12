import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/lib/settings";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/calendar")({ component: CalendarPage });

type DayNote = {
  id: string;
  title: string;
  note: string;
  createdAt: string;
};

type CalendarNotes = Record<string, DayNote[]>;

const STORAGE_KEY = "calendar-notes-v1";

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function CalendarPage() {
  const { t, lang } = useSettings();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [notesByDay, setNotesByDay] = useState<CalendarNotes>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CalendarNotes;
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

  const monthName = currentMonth.toLocaleString(undefined, { month: "long", year: "numeric" });
  const monthPrefix = currentMonth.toISOString().slice(0, 7);
  const totalNotesInMonth = Object.entries(notesByDay).reduce((sum, [day, entries]) => {
    if (!day.startsWith(monthPrefix)) return sum;
    return sum + entries.length;
  }, 0);

  const daysWithNotes = useMemo(
    () =>
      Object.entries(notesByDay)
        .filter(([, entries]) => entries.length > 0)
        .map(([day]) => new Date(`${day}T12:00:00`)),
    [notesByDay],
  );

  const monthPreview = useMemo(
    () =>
      Object.entries(notesByDay)
        .filter(([day, entries]) => day.startsWith(monthPrefix) && entries.length > 0)
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .slice(0, 6),
    [monthPrefix, notesByDay],
  );

  const addNote = () => {
    const cleanTitle = title.trim();
    const cleanNote = note.trim();
    if (!cleanTitle && !cleanNote) return;

    const newNote: DayNote = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title: cleanTitle || t("calendarUntitledNote"),
      note: cleanNote,
      createdAt: new Date().toISOString(),
    };

    setNotesByDay((prev) => ({
      ...prev,
      [selectedKey]: [newNote, ...(prev[selectedKey] ?? [])],
    }));
    setTitle("");
    setNote("");
  };

  const removeNote = (id: string) => {
    setNotesByDay((prev) => {
      const nextDay = (prev[selectedKey] ?? []).filter((item) => item.id !== id);
      if (nextDay.length === 0) {
        const { [selectedKey]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [selectedKey]: nextDay };
    });
  };

  const clearSelectedDay = () => {
    setNotesByDay((prev) => {
      const { [selectedKey]: _removed, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div>
      <PageHeader title={t("calendar")} description={t("calendarDesc")} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base capitalize">{monthName}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>
                {Object.keys(notesByDay).length} {t("calendarActiveDays")}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(next) => next && setSelectedDate(next)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{ hasNotes: daysWithNotes }}
              modifiersClassNames={{ hasNotes: "bg-primary/10 text-primary font-semibold rounded-md" }}
              className="w-full rounded-xl border bg-card p-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("calendarDailyNotes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{selectedDate.toLocaleDateString(lang)}</p>
                  <Badge variant="secondary">
                    {selectedDayNotes.length} {t("calendarNotesCount")}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("calendarTitle")}
                    maxLength={80}
                  />
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("calendarWriteNote")}
                    className="min-h-[90px]"
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={addNote} size="sm" className="gap-1.5">
                      <Plus className="h-4 w-4" />
                      {t("save")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                      {t("today")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={selectedDayNotes.length === 0}
                      onClick={clearSelectedDay}
                    >
                      {t("calendarClearDay")}
                    </Button>
                  </div>
                </div>
              </div>

              {selectedDayNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("calendarNoNotesForDay")}</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayNotes.map((item) => (
                    <div key={item.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          {item.note && (
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{item.note}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(item.createdAt).toLocaleTimeString(lang, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeNote(item.id)}
                          aria-label={t("calendarDeleteNote")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-sm font-medium">{t("upcoming")}</p>
                <p className="text-xs text-muted-foreground">
                  {totalNotesInMonth} {t("calendarNotesInMonth")}
                </p>
                {monthPreview.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noEvents")}</p>
                ) : (
                  monthPreview.map(([day, entries]) => (
                    <div key={day} className="flex items-center justify-between text-sm">
                      <span>{new Date(`${day}T12:00:00`).toLocaleDateString(lang)}</span>
                      <Badge variant="outline">{entries.length}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
