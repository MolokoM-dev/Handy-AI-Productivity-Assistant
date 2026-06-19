import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Copy } from "lucide-react";
import { AiOutput } from "@/components/AiOutput";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — Handy Assistant" }] }),
  component: EmailPage,
});

const tones = ["Professional", "Friendly", "Persuasive", "Apologetic", "Concise", "Enthusiastic", "Formal"];

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [persona, setPersona] = useState("");
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persona.trim() || !purpose.trim() || !audience.trim()) {
      toast.error("Please describe who you are, the purpose, and the audience.");
      return;
    }
    setLoading(true); setResult("");
    try {
      const { text } = await fn({ data: { persona, purpose, audience, tone, context } });
      setResult(text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate email");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Smart Email Generator</CardTitle>
          </div>
          <CardDescription>Generate emails tailored to your audience and tone.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="persona">Who are you?</Label>
              <Input id="persona" placeholder="e.g. Product manager at a fintech startup" value={persona} onChange={(e) => setPersona(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purpose">Purpose</Label>
              <Input id="purpose" placeholder="e.g. Decline a meeting invite, request a deadline extension" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audience">Audience</Label>
              <Input id="audience" placeholder="e.g. Senior client, manager, vendor" value={audience} onChange={(e) => setAudience(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tones.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="context">Additional context (optional)</Label>
              <Textarea id="context" rows={4} placeholder="Background details, names, dates, key points to include..." value={context} onChange={(e) => setContext(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : "Generate Email"}
            </Button>
            <AiDisclaimer />
          </form>
        </CardContent>
      </Card>

      <Card className="lg:sticky lg:top-20 lg:h-fit">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Draft</CardTitle>
            {result && (
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied"); }}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonLines />
          ) : result ? (
            <AiOutput text={result} />
          ) : (
            <EmptyState text="Your generated email will appear here." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SkeletonLines() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3 w-3/4 rounded bg-muted" />
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-5/6 rounded bg-muted" />
      <div className="h-3 w-2/3 rounded bg-muted" />
      <div className="h-3 w-4/5 rounded bg-muted" />
    </div>
  );
}
function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</div>;
}

export { SkeletonLines, EmptyState };
