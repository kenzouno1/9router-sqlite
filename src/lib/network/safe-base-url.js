// Defense-in-depth SSRF guard for user-supplied provider baseUrl values.
// Blocks non-http(s) schemes and known cloud metadata endpoints. Loopback
// and RFC1918 ranges are allowed because users legitimately run local LLM
// servers (ollama, vLLM, LM Studio) on this self-hosted app.

const BLOCKED_HOSTS = new Set([
  "169.254.169.254", // AWS / GCP / Azure / OpenStack IMDS
  "metadata.google.internal",
  "metadata.goog",
  "100.100.100.200", // Alibaba Cloud metadata
]);

const BLOCKED_HOST_SUFFIXES = [
  ".internal", // GCP metadata aliases
];

// IPv4-mapped IPv6 (e.g. ::ffff:a9fe:a9fe) → dotted IPv4, so the blocklist
// catches `http://[::ffff:169.254.169.254]/` style IMDS bypasses.
function ipv4MappedToV4(h) {
  const m = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(h);
  if (!m) return null;
  const a = parseInt(m[1], 16);
  const b = parseInt(m[2], 16);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return [(a >> 8) & 0xff, a & 0xff, (b >> 8) & 0xff, b & 0xff].join(".");
}

function normalizeHost(host) {
  let h = (host || "").toLowerCase().replace(/^\[|\]$/g, "");
  // Strip trailing dot on FQDNs (e.g. `metadata.google.internal.`).
  if (h.endsWith(".") && !h.includes(":")) h = h.slice(0, -1);
  const mapped = ipv4MappedToV4(h);
  if (mapped) h = mapped;
  return h;
}

export function validateBaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
    return { ok: false, error: "Base URL is required" };
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: "Invalid URL format" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http(s) URLs are allowed" };
  }

  const host = normalizeHost(parsed.hostname);
  if (!host) return { ok: false, error: "URL must include a hostname" };

  if (BLOCKED_HOSTS.has(host)) {
    return { ok: false, error: "Base URL targets a blocked address" };
  }
  if (BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    return { ok: false, error: "Base URL targets a blocked address" };
  }
  // IPv6 link-local fe80::/10 and IPv6 metadata fd00:ec2::254
  if (host.startsWith("fe80:") || host === "fd00:ec2::254") {
    return { ok: false, error: "Base URL targets a blocked address" };
  }

  return { ok: true, url: parsed };
}
