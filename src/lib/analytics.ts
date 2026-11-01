/**
 * Small client-side helpers for custom GA4 interactions.
 * Import this from a tool component and call trackToolUse after a successful action.
 */
export function trackToolUse(action: string, toolName?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("toolbox:tool-use", {
      detail: {
        action,
        tool_name: toolName ?? window.location.pathname.split("/").filter(Boolean).at(-1) ?? "unknown",
      },
    }),
  );
}
