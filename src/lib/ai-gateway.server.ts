import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

/** Masks obvious personal data before it ever leaves the platform. */
export function redactPii(text: string) {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email redacted]")
    .replace(/(\+?\d[\d\s().-]{7,}\d)/g, "[phone redacted]")
    .replace(/\b(?:\d[ -]?){13,19}\b/g, "[card redacted]");
}
