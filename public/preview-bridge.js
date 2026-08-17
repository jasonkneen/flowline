/**
 * Vanilla guest side of the grok-web ↔ sandbox preview postMessage bridge.
 * Mirrors src/lib/preview-host-bridge.ts so the game document (not just the
 * React shell) can talk to the preview chrome.
 */
const CHANNEL = "grok-preview-bridge";
const VERSION = 1;
const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";

function isGrokEmbedderOrigin(origin) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    if (host === "grok.com" || host.endsWith(".grok.com")) return true;
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
    return false;
  } catch {
    return false;
  }
}

function isSandboxPreviewGuestHost(hostname) {
  const host = hostname.toLowerCase();
  return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}

function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname) {
  if (parentIsSelf) return null;
  const candidates = [referrer, ancestorOrigin ?? ""].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const origin = candidate.includes("://") ? new URL(candidate).origin : candidate;
      if (isGrokEmbedderOrigin(origin)) return origin;
      if (!isSandboxPreviewGuestHost(guestHostname)) continue;
      const parsed = new URL(origin.includes("://") ? origin : `https://${origin}`);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.origin;
    } catch {
      /* try next */
    }
  }
  return null;
}

function isSafeBridgePath(path) {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
  try {
    return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
  } catch {
    return false;
  }
}

function installPreviewHostBridge() {
  if (typeof window === "undefined") return;
  const ancestorOrigin =
    typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0
      ? location.ancestorOrigins[0]
      : null;
  const parentOrigin = resolveParentEmbedderOrigin(
    window.parent === window,
    document.referrer,
    ancestorOrigin,
    window.location.hostname,
  );
  if (parentOrigin === null) return;

  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);
  const isAtHistoryRoot = () => {
    const state = window.history.state;
    return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
  };

  try {
    const current = window.history.state;
    const alreadyTagged =
      current !== null &&
      typeof current === "object" &&
      Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY);
    if (!alreadyTagged) {
      const isRoot = window.history.length <= 1;
      const marked =
        current && typeof current === "object"
          ? { ...current, [ROOT_STATE_KEY]: isRoot }
          : { [ROOT_STATE_KEY]: isRoot };
      originalReplaceState(marked, "", window.location.href);
    }
  } catch {
    /* ignore */
  }

  const post = (message) => window.parent.postMessage(message, parentOrigin);
  const reportLocation = () => {
    post({
      channel: CHANNEL,
      version: VERSION,
      type: "location",
      path: window.location.pathname || "/",
      search: window.location.search,
      hash: window.location.hash,
    });
  };

  const announce = () => {
    reportLocation();
    post({ channel: CHANNEL, version: VERSION, type: "routes", paths: ["/", "/login"] });
    post({ channel: CHANNEL, version: VERSION, type: "ready" });
  };

  const navigate = (path) => {
    if (!isSafeBridgePath(path)) return;
    try {
      const url = new URL(path, window.location.origin);
      if (url.origin !== window.location.origin) return;
      window.location.assign(`${url.pathname}${url.search}${url.hash}`);
    } catch {
      /* ignore */
    }
  };

  const onMessage = (event) => {
    if (event.source !== window.parent || event.origin !== parentOrigin) return;
    const data = event.data;
    if (!data || data.channel !== CHANNEL || data.version !== VERSION) return;
    if (data.type === "hello") {
      announce();
      return;
    }
    if (data.type === "navigate" && typeof data.path === "string") {
      navigate(data.path);
      return;
    }
    if (data.type === "history" && (data.delta === -1 || data.delta === 1)) {
      if (data.delta === -1 && isAtHistoryRoot()) return;
      window.history.go(data.delta);
    }
  };

  window.history.pushState = (data, unused, url) => {
    const next = data && typeof data === "object" ? { ...data, [ROOT_STATE_KEY]: false } : data;
    originalPushState(next, unused, url);
    reportLocation();
  };
  window.history.replaceState = (data, unused, url) => {
    const next = isAtHistoryRoot()
      ? { ...(data && typeof data === "object" ? data : {}), [ROOT_STATE_KEY]: true }
      : data;
    originalReplaceState(next, unused, url);
    reportLocation();
  };

  window.addEventListener("message", onMessage);
  window.addEventListener("popstate", reportLocation);
  window.addEventListener("hashchange", reportLocation);
  announce();
}

installPreviewHostBridge();
