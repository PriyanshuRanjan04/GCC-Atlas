import { ExternalLink } from "lucide-react";

interface Props {
  urls: string[];
  label?: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function SourceLinks({ urls, label = "Sources" }: Props) {
  if (!urls || urls.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-text-muted shrink-0">{label}:</span>
      {urls.map((url, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-surface-2 border border-border text-text-secondary hover:text-teal hover:border-teal/40 transition-colors"
        >
          {getDomain(url)}
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </a>
      ))}
    </div>
  );
}
