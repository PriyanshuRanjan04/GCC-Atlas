"use client";

/**
 * AskAtlasCardButton
 *
 * A "btn-primary"-styled button that opens the Ask Atlas side drawer
 * by firing a "open-ask-atlas" CustomEvent on window.
 * FloatingAskAtlas listens for this event and calls setOpen(true).
 *
 * This component is needed because app/page.tsx is a Server Component
 * and cannot hold client-side state directly.
 */
export function AskAtlasCardButton() {
  function openDrawer() {
    window.dispatchEvent(new CustomEvent("open-ask-atlas"));
  }

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="btn-primary ask-atlas-card-btn"
      style={{ alignSelf: "flex-start", fontSize: "0.875rem", cursor: "pointer" }}
    >
      Ask Atlas
    </button>
  );
}
