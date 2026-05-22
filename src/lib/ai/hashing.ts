
/**
 * Helper to generate SHA-256 hashes for AI outputs and contexts.
 * Uses Web Crypto API for compatibility with Edge Functions and Browsers.
 */
export async function generateHash(data: any): Promise<string> {
  const msgUint8 = new TextEncoder().encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function hashPrompt(prompt: any) { return generateHash(prompt); }
export async function hashContext(context: any) { return generateHash(context); }
export async function hashOutput(output: any) { return generateHash(output); }
