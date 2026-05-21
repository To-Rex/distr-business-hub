import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AdminGuard } from "@/features/admin/admin-guard";
import { AdminLayout } from "@/features/admin/admin-layout";
import { useSettings } from "@/lib/settings";
import { sendAiQuery, type AiQueryResponse } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, Terminal, Database } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ai-agent")({
  component: AdminAiAgentPage,
});

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  data?: Record<string, unknown>[];
};

function AdminAiAgentPage() {
  const { t } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Assalomu alaykum! Men **MX Agent** — ma'lumotlar bazasi bo'yicha yordamchi. Istalgan savolingizni bering, masalan: *\"Nechta foydalanuvchi mavjud?\"* yoki *\"Oxirgi 10 ta buyurtmani ko'rsat\"*",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput("");
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res: AiQueryResponse = await sendAiQuery({ question });
      let answerContent = res.answer || res.formatted || "";
      try {
        const parsed = JSON.parse(answerContent);
        answerContent = parsed.formatted || parsed.plain || answerContent;
      } catch {}
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answerContent,
        sql: res.sql,
        data: res.data,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast.error(err.message || "So'rov jo'natishda xatolik yuz berdi");
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Kechirasiz, so'rovingizni qayta ishlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title={t("adminAiAgent")} subtitle={t("adminAiAgentSubtitle")}>
        <div className="flex flex-col h-[calc(100vh-16rem)]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/50 border rounded-bl-md"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                  {msg.sql && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <details className="group">
                        <summary className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                          <Terminal className="h-3 w-3" />
                          SQL so'rov
                        </summary>
                        <pre className="mt-2 p-3 rounded-lg bg-background text-xs font-mono overflow-x-auto">
                          {msg.sql}
                        </pre>
                      </details>
                    </div>
                  )}
                  {msg.data && msg.data.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <details className="group">
                        <summary className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                          <Database className="h-3 w-3" />
                          Ma'lumotlar ({msg.data.length} qator)
                        </summary>
                        <pre className="mt-2 p-3 rounded-lg bg-background text-xs font-mono overflow-x-auto max-h-40 overflow-y-auto">
                          {JSON.stringify(msg.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary mt-1">
                    <span className="text-xs font-semibold text-primary-foreground">
                      S
                    </span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted/50 border rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-muted-foreground">Tahlil qilinmoqda...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Savolingizni yozing..."
                disabled={isLoading}
                className="flex-1 h-12 text-base"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-12 w-12 shrink-0"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
