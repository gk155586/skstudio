const JWT_SECRET = process.env.JWT_SECRET || "sk-studio-pune-enterprise-secret-signature-2026";

function base64UrlToBuffer(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(padded, "base64");
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return view;
  }

  const binary = atob(padded);
  const ab = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(ab);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

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

export async function signJWT(payload: any, expiryMs: number = 30 * 24 * 60 * 60 * 1000): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Date.now() + expiryMs;
  const fullPayload = { ...payload, exp };

  const enc = new TextEncoder();
  const encodedHeader = uint8ArrayToBase64Url(enc.encode(JSON.stringify(header)));
  const encodedPayload = uint8ArrayToBase64Url(enc.encode(JSON.stringify(fullPayload)));

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`${encodedHeader}.${encodedPayload}`)
  );

  const signature = uint8ArrayToBase64Url(new Uint8Array(signatureBuffer));
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyJWT(token: string): Promise<any | null> {
  try {
    if (!token || typeof token !== "string") return null;
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
      sigBuf.buffer as ArrayBuffer,
      dataBuf.buffer as ArrayBuffer
    );

    if (!isValid) return null;

    const payloadRaw = new TextDecoder().decode(base64UrlToBuffer(encodedPayload));
    const payload = JSON.parse(payloadRaw);

    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("[JWT Auth] Verification error:", error);
    return null;
  }
}
