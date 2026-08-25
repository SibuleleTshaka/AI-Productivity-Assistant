import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h3 className="text-base font-semibold" {...p} />,
          h2: (p) => <h3 className="text-base font-semibold" {...p} />,
          h3: (p) => <h4 className="text-sm font-semibold" {...p} />,
          p: (p) => <p className="whitespace-pre-wrap" {...p} />,
          ul: (p) => <ul className="list-disc space-y-1 pl-5" {...p} />,
          ol: (p) => <ol className="list-decimal space-y-1 pl-5" {...p} />,
          strong: (p) => <strong className="font-semibold text-primary" {...p} />,
          a: (p) => <a className="text-primary underline" {...p} />,
          code: (p) => <code className="rounded bg-muted px-1 py-0.5 text-xs" {...p} />,
          table: (p) => (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-xs" {...p} />
            </div>
          ),
          th: (p) => <th className="bg-muted px-3 py-2 font-semibold" {...p} />,
          td: (p) => <td className="border-t border-border px-3 py-2 align-top" {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
