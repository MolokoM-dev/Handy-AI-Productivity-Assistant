import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { researchTopic } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Copy } from "lucide-react";
import { AiOutput } from "@/components/AiOutput";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { SkeletonLines, EmptyState } from "@/routes/_app.email";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant — Handy Assistant" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim().length < 2) { toast.error("Enter a topic to research."); return; }
    setLoading(true); setResult("");
    try {
      const { text } = await fn({ data: { topic, focus } });
      setResult(text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to research");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle>AI Research Assistant</CardTitle>
          </div>
          <CardDescription>Get a structured briefing on any topic.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" placeholder="e.g. Generative AI in B2B SaaS pricing" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="focus">Focus (optional)</Label>
              <Input id="focus" placeholder="e.g. Risks for mid-market companies" value={focus} onChange={(e) => setFocus(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Researching…</> : "Generate Briefing"}
            </Button>
            <AiDisclaimer />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Briefing</CardTitle>
            {result && (
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied"); }}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <SkeletonLines /> : result ? <AiOutput text={result} /> : <EmptyState text="Your research briefing will appear here." />}
        </CardContent>
      </Card>
    </div>
  );
}
