import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText, ListChecks, Search, MessageSquare, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Handy Assistant — Your AI productivity companion" },
      { name: "description", content: "Handy Assistant helps you draft emails, summarize meetings, plan tasks, research, and chat — all powered by AI." },
    ],
  }),
  component: Dashboard,
});

const features = [
  { to: "/email", title: "Smart Email Generator", desc: "Draft polished emails tuned by tone and audience.", icon: Mail },
  { to: "/meetings", title: "Meeting Notes Summarizer", desc: "Turn raw notes into key points, actions, and deadlines.", icon: FileText },
  { to: "/tasks", title: "AI Task Planner", desc: "Prioritize and schedule your day with the Eisenhower matrix.", icon: ListChecks },
  { to: "/research", title: "AI Research Assistant", desc: "Get balanced briefings on any topic with sources to verify.", icon: Search },
  { to: "/chat", title: "AI Chatbot", desc: "Conversational assistant for everything productivity.", icon: MessageSquare },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Handy Assistant
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Your AI <span className="text-gradient">productivity companion</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Five focused AI tools to help you write, summarize, plan, research, and decide — faster. Install Handy on any device for one-tap access.
        </p>
      </section>


      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="group">
            <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Open tool →
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
