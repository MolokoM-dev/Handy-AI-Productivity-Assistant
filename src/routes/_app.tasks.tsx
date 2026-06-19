import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { planTasks } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ListChecks, Copy, Plus } from "lucide-react";
import { AiOutput } from "@/components/AiOutput";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { SkeletonLines, EmptyState } from "@/routes/_app.email";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "AI Task Planner — Handy Assistant" }] }),
  component: TasksPage,
});

function TasksPage() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState("today");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tasks.trim().length < 3) { toast.error("List a few tasks first."); return; }
    setLoading(true); setResult("");
    try {
      const { text } = await fn({ data: { tasks, horizon } });
      setResult(text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to plan tasks");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <CardTitle>AI Task Planner</CardTitle>
          </div>
          <CardDescription>Prioritize and time-block your tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tasks">Your tasks</Label>
              <Textarea id="tasks" rows={10} placeholder={"e.g.\nFinish Q3 report\nReply to client emails\nPrep for Friday demo\nGym at 6pm"} value={tasks} onChange={(e) => setTasks(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Planning horizon</Label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this week">This week</SelectItem>
                  <SelectItem value="next week">Next week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning…</> : "Generate Plan"}
            </Button>
            <AiDisclaimer />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Plan</CardTitle>
            {result && (
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied"); }}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <SkeletonLines /> : result ? <AiOutput text={result} /> : <EmptyState text="Your prioritized schedule will appear here." />}
        </CardContent>
      </Card>
    </div>
  );
}
