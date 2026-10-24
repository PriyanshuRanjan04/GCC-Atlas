import { cn } from "@/lib/utils";

interface Props {
  value: string | number | null | undefined;
  className?: string;
  prefix?: string;
  suffix?: string;
  format?: (v: string | number) => string;
}

export function NullableValue({ value, className, prefix, suffix, format }: Props) {
  if (value === null || value === undefined || value === "") {
    return <span className={cn("null-value", className)}>Not disclosed</span>;
  }
  const display = format ? format(value) : String(value);
  return (
    <span className={cn("text-text-primary", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

interface HeadcountProps {
  headcount: { min: number; max: number; as_of: string } | null;
  className?: string;
}

export function HeadcountValue({ headcount, className }: HeadcountProps) {
  if (!headcount) {
    return <span className={cn("null-value", className)}>Not disclosed</span>;
  }
  return (
    <span className={cn("text-text-primary", className)}>
      {headcount.min.toLocaleString()}–{headcount.max.toLocaleString()}
      <span className="text-text-muted text-xs ml-1.5">
        (as of {headcount.as_of})
      </span>
    </span>
  );
}
