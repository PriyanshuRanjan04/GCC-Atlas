import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/types";

interface Props {
  confidence: Confidence;
  size?: "sm" | "md";
}

const config: Record<Confidence, { label: string; className: string; dot: string }> = {
  verified: {
    label: "Verified",
    className: "bg-teal/10 text-teal border border-teal/30",
    dot: "bg-teal",
  },
  reported: {
    label: "Reported",
    className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  estimated: {
    label: "Estimated",
    className: "bg-red-500/10 text-red-400 border border-red-500/30",
    dot: "bg-red-400",
  },
};

export function ConfidenceBadge({ confidence, size = "md" }: Props) {
  const c = config[confidence];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        c.className
      )}
      title={`Data confidence: ${confidence}`}
    >
      <span className={cn("rounded-full shrink-0", size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2", c.dot)} />
      {c.label}
    </span>
  );
}
