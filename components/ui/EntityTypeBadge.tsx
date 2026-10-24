import { cn } from "@/lib/utils";
import type { EntityType } from "@/lib/types";

interface Props {
  entityType: EntityType;
  size?: "sm" | "md";
}

const config: Record<EntityType, { label: string; className: string }> = {
  captive_gcc: {
    label: "Captive GCC",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  professional_services_delivery: {
    label: "Prof. Services",
    className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  },
  regulated_ifsc_entity: {
    label: "IFSC Entity",
    className: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  },
  service_provider: {
    label: "Service Provider",
    className: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  },
};

export function EntityTypeBadge({ entityType, size = "md" }: Props) {
  const c = config[entityType];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        c.className
      )}
    >
      {c.label}
    </span>
  );
}
