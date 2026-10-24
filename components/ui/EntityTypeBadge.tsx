import type { EntityType } from "@/lib/types";

interface Props {
  entityType: EntityType;
  size?: "sm" | "md";
}

const config: Record<EntityType, { label: string; bg: string; color: string }> = {
  captive_gcc: {
    label: "Captive GCC",
    bg: "rgba(59,130,246,0.10)",
    color: "#60A5FA",
  },
  professional_services_delivery: {
    label: "Prof. Services",
    bg: "rgba(168,85,247,0.10)",
    color: "#C084FC",
  },
  regulated_ifsc_entity: {
    label: "IFSC Entity",
    bg: "rgba(249,115,22,0.10)",
    color: "#FB923C",
  },
  service_provider: {
    label: "Service Provider",
    bg: "rgba(107,114,128,0.10)",
    color: "#9CA3AF",
  },
};

export function EntityTypeBadge({ entityType, size = "md" }: Props) {
  const c = config[entityType];
  const padding = size === "sm" ? "0.125rem 0.5rem" : "0.25rem 0.625rem";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "0.375rem",
        fontSize: "0.75rem",
        fontWeight: 500,
        padding,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.color}30`,
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}
