import { AlertTriangle, ShieldCheck } from "lucide-react";

export function AiDisclaimer({
  className = "",
  variant = "review",
}: {
  className?: string;
  variant?: "review" | "privacy";
}) {
  if (variant === "privacy") {
    return (
      <div
        className={`flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground ${className}`}
      >
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Privacy: your input is sent to the AI provider only to generate this response. It is not
          stored on our servers or used to train models. Avoid sharing passwords, payment details,
          or other sensitive personal data.
        </span>
      </div>
    );
  }
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground ${className}`}
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>AI-generated content may require human review.</span>
    </div>
  );
}
