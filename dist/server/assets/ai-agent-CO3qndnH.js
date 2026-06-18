import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { A as AdminGuard, a as AdminLayout } from "./admin-layout-CqfASTxn.js";
import { w as useSettings, I as Input, a as Button } from "./router-CHkxHBR7.js";
import { N as sendAiQuery } from "./admin-api-CS6ZGJ5E.js";
import { Bot, Terminal, Database, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./auth-D31UknyM.js";
import "./tooltip-DxSZqTIe.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "@radix-ui/react-select";
function AdminAiAgentPage() {
  const {
    t
  } = useSettings();
  const [messages, setMessages] = useState([{
    id: "welcome",
    role: "assistant",
    content: `Assalomu alaykum! Men **MX Agent** — ma'lumotlar bazasi bo'yicha yordamchi. Istalgan savolingizni bering, masalan: *"Nechta foydalanuvchi mavjud?"* yoki *"Oxirgi 10 ta buyurtmani ko'rsat"*`
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;
    setInput("");
    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const res = await sendAiQuery({
        question
      });
      let answerContent = res.answer || res.formatted || "";
      try {
        const parsed = JSON.parse(answerContent);
        answerContent = parsed.formatted || parsed.plain || answerContent;
      } catch {
      }
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answerContent,
        sql: res.sql,
        data: res.data
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      toast.error(err.message || "So'rov jo'natishda xatolik yuz berdi");
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Kechirasiz, so'rovingizni qayta ishlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return /* @__PURE__ */ jsx(AdminGuard, { children: /* @__PURE__ */ jsx(AdminLayout, { title: t("adminAiAgent"), subtitle: t("adminAiAgentSubtitle"), children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-[calc(100vh-16rem)]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth", children: [
      messages.map((msg) => /* @__PURE__ */ jsxs("div", { className: `flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`, children: [
        msg.role === "assistant" && /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1", children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { className: `max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted/50 border rounded-bl-md"}`, children: [
          msg.role === "user" ? /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap", children: msg.content }) : /* @__PURE__ */ jsx("div", { className: "prose prose-sm dark:prose-invert max-w-none", children: /* @__PURE__ */ jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: msg.content }) }),
          msg.sql && /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-border/50", children: /* @__PURE__ */ jsxs("details", { className: "group", children: [
            /* @__PURE__ */ jsxs("summary", { className: "flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors", children: [
              /* @__PURE__ */ jsx(Terminal, { className: "h-3 w-3" }),
              "SQL so'rov"
            ] }),
            /* @__PURE__ */ jsx("pre", { className: "mt-2 p-3 rounded-lg bg-background text-xs font-mono overflow-x-auto", children: msg.sql })
          ] }) }),
          msg.data && msg.data.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-border/50", children: /* @__PURE__ */ jsxs("details", { className: "group", children: [
            /* @__PURE__ */ jsxs("summary", { className: "flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors", children: [
              /* @__PURE__ */ jsx(Database, { className: "h-3 w-3" }),
              "Ma'lumotlar (",
              msg.data.length,
              " qator)"
            ] }),
            /* @__PURE__ */ jsx("pre", { className: "mt-2 p-3 rounded-lg bg-background text-xs font-mono overflow-x-auto max-h-40 overflow-y-auto", children: JSON.stringify(msg.data, null, 2) })
          ] }) })
        ] }),
        msg.role === "user" && /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary mt-1", children: /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-primary-foreground", children: "S" }) })
      ] }, msg.id)),
      isLoading && /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-start", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1", children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4 text-primary" }) }),
        /* @__PURE__ */ jsx("div", { className: "max-w-[80%] rounded-2xl px-4 py-3 bg-muted/50 border rounded-bl-md", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary/40 animate-bounce", style: {
              animationDelay: "0ms"
            } }),
            /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary/40 animate-bounce", style: {
              animationDelay: "150ms"
            } }),
            /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary/40 animate-bounce", style: {
              animationDelay: "300ms"
            } })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Tahlil qilinmoqda..." })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Input, { ref: inputRef, value: input, onChange: (e) => setInput(e.target.value), onKeyDown: handleKeyDown, placeholder: "Savolingizni yozing...", disabled: isLoading, className: "flex-1 h-12 text-base" }),
      /* @__PURE__ */ jsx(Button, { onClick: handleSend, disabled: !input.trim() || isLoading, size: "icon", className: "h-12 w-12 shrink-0", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" }) : /* @__PURE__ */ jsx(Send, { className: "h-5 w-5" }) })
    ] }) })
  ] }) }) });
}
export {
  AdminAiAgentPage as component
};
