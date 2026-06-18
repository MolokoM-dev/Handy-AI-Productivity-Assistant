import ReactMarkdown from "react-markdown";

export function AiOutput({ text }: { text: string }) {
  return (
    <div className="prose-ai text-sm text-foreground">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
