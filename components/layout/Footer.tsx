export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        backgroundColor: "var(--color-canvas)",
        marginTop: "6rem",
      }}
    >
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "2.5rem 1rem",
        }}
      >
        {/* Logo + disclaimer */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
            <span
              style={{
                width: "1.375rem",
                height: "1.375rem",
                borderRadius: "0.3rem",
                background: "var(--color-teal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "0.75rem",
                color: "var(--color-text-inverse)",
                flexShrink: 0,
              }}
            >
              G
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9375rem",
                letterSpacing: "-0.01em",
                color: "var(--color-text-primary)",
              }}
            >
              GCC Atlas
            </span>
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              maxWidth: "26rem",
              lineHeight: 1.6,
            }}
          >
            Seed dataset: sourced from public reports and news, not exhaustive.
            Salary and rent figures are estimates. Not for investment decisions.
          </p>
        </div>

        {/* Copyright + version */}
        <div
          style={{
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            © 2026 GCC Atlas — prototype.
          </span>
          <span
            style={{
              fontSize: "0.6875rem",
              fontFamily: "var(--font-mono)",
              color: "rgba(0,201,167,0.5)",
              letterSpacing: "0.05em",
            }}
          >
            v0.1.0-alpha
          </span>
        </div>
      </div>
    </footer>
  );
}
