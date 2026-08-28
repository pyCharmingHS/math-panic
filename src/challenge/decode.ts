import { isValidChallengePayload, type ChallengePayload } from "./schema";

function base64UrlToBytes(encoded: string): Uint8Array {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * Decodes a `?c=` URL param back into a challenge config. Returns null for
 * anything malformed, out of range, or an unsupported version — the caller
 * falls back to a normal (non-challenge) game rather than trusting it.
 */
export function decodeChallenge(encoded: string): ChallengePayload | null {
  if (encoded.length > 500) return null;
  try {
    const bytes = base64UrlToBytes(encoded);
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);
    return isValidChallengePayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
