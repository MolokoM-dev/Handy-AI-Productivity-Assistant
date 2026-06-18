import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({ meta: [{ title: "AI Chat — Handy Assistant" }] }),
  component: ChatPage,
});

const transport = new DefaultChatTransport({ api: "/api/chat" });

function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (e) => toast.error(e.message || "Chat error"),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, status]);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (status === "ready") inputRef.current?.focus(); }, [status]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-4xl flex-col">
      <Card className="flex h-full flex-col overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>AI Chat</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <EmptyChat />
            ) : (
              <div className="space-y-5">
                {messages.map((m) => {
                  const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
                  const isUser = m.role === "user";
                  return (
                    <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                      {!isUser && (
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-primary text-primary-foreground">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      )}
                      <div className={isUser
                        ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm"
                        : "max-w-[85%] text-sm text-foreground"}>
                        {isUser ? text : <div className="prose-ai"><ReactMarkdown>{text}</ReactMarkdown></div>}
                      </div>
                    </div>
                  );
                })}
                {status === "submitted" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <div className="border-t bg-background p-3 sm:p-4">
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(e); } }}
              placeholder="Ask anything about your work…"
              rows={1}
              className="min-h-[44px] resize-none"
              disabled={busy}
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <AiDisclaimer className="mt-2" />
        </div>
      </Card>
    </div>
  );
}

function EmptyChat() {
  const suggestions = [
    "Help me write a follow-up email to a client",
    "Summarize how to run an effective 1:1",
    "Plan my afternoon: 3 deep-work blocks + admin",
    "Explain OKRs vs KPIs in 5 bullets",
  ];
  return (
    <div className="grid h-full place-items-center">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Your AI productivity copilot</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ask anything—writing, planning, research, or quick decisions.</p>
        </div>
        <div className="grid gap-2 text-left">
          {suggestions.map((s) => (
            <div key={s} className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
