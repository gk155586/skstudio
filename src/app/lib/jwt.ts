const JWT_SECRET = process.env.JWT_SECRET || "sk-studio-pune-enterprise-secret-signature-2026";

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufferToBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlToBuffer(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function signJWT(payload: any, expiryMs: number = 24 * 60 * 60 * 1000): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Date.now() + expiryMs;
  const fullPayload = { ...payload, exp };

  const enc = new TextEncoder();
  const encodedHeader = bufferToBase64Url(enc.encode(JSON.stringify(header)));
  const encodedPayload = bufferToBase64Url(enc.encode(JSON.stringify(fullPayload)));

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`${encodedHeader}.${encodedPayload}`)
  );

  const signature = bufferToBase64Url(signatureBuffer);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const enc = new TextEncoder();

    const key = await getCryptoKey();
    const dataBuf = enc.encode(`${encodedHeader}.${encodedPayload}`);
    const sigBuf = base64UrlToBuffer(signature);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuf,
      dataBuf
    );

    if (!isValid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBuffer(encodedPayload)));

    if (payload.exp && Date.now() > payload.exp) {
      console.log("[JWT Auth] Verification failed: Session expired.");
      return null;
    }

    return payload;
  } catch (error) {
    console.error("[JWT Auth] Verification syntax error:", error);
    return null;
  }
}
