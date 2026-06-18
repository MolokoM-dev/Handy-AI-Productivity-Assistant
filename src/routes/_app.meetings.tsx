import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeNotes } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, Copy } from "lucide-react";
import { AiOutput } from "@/components/AiOutput";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { SkeletonLines, EmptyState } from "@/routes/_app.email";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/meetings")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — Handy Assistant" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const fn = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim().length < 10) { toast.error("Paste meeting notes or a transcript."); return; }
    setLoading(true); setResult("");
    try {
      const { text } = await fn({ data: { notes } });
      setResult(text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to summarize");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Meeting Notes Summarizer</CardTitle>
          </div>
          <CardDescription>Paste raw notes or a transcript — get key points, decisions, and action items.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes / transcript</Label>
              <Textarea id="notes" rows={14} placeholder="Paste raw meeting notes here…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing…</> : "Summarize Meeting"}
            </Button>
            <AiDisclaimer />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Summary</CardTitle>
            {result && (
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied"); }}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <SkeletonLines /> : result ? <AiOutput text={result} /> : <EmptyState text="Your structured summary will appear here." />}
        </CardContent>
      </Card>
    </div>
  );
}
