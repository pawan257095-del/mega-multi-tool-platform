import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

function apr1(password: string, saltInput?: string) {
  const salt = (saltInput ?? randomBytes(6).toString("base64").replace(/[^a-zA-Z0-9]/g, "")).slice(0, 8);
  const magic = "$apr1$";
  const pw = Buffer.from(password, "utf8");
  let ctx = Buffer.concat([pw, Buffer.from(magic + salt)]);
  let final = createHash("md5").update(Buffer.concat([pw, Buffer.from(salt), pw])).digest();

  for (let remaining = pw.length; remaining > 0; remaining -= 16) {
    ctx = Buffer.concat([ctx, final.subarray(0, Math.min(16, remaining))]);
  }
  for (let n = pw.length; n > 0; n >>= 1) {
    ctx = Buffer.concat([ctx, (n & 1) ? Buffer.from([0]) : pw.subarray(0, 1)]);
  }
  final = createHash("md5").update(ctx).digest();

  for (let i = 0; i < 1000; i++) {
    const parts: Buffer[] = [];
    parts.push((i & 1) ? pw : final);
    if (i % 3 !== 0) parts.push(Buffer.from(salt));
    if (i % 7 !== 0) parts.push(pw);
    parts.push((i & 1) ? final : pw);
    final = createHash("md5").update(Buffer.concat(parts)).digest();
  }

  const encode = (a: number, b: number, c: number, n: number) => {
    const chars = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let v = (a << 16) | (b << 8) | c;
    let out = "";
    for (let j = 0; j < n; j++) {
      out += chars[v & 0x3f];
      v >>>= 6;
    }
    return out;
  };
  const encoded =
    encode(final[0], final[6], final[12], 4) +
    encode(final[1], final[7], final[13], 4) +
    encode(final[2], final[8], final[14], 4) +
    encode(final[3], final[9], final[15], 4) +
    encode(final[4], final[10], final[5], 4) +
    encode(0, 0, final[11], 2);
  return `${magic}${salt}$${encoded}`;
}

export async function POST(request: NextRequest) {
  let body: { username?: unknown; password?: unknown; mode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const mode = body.mode;
  if (!username || username.length > 255 || username.includes(":") || /[\r\n]/.test(username)) {
    return NextResponse.json({ error: "Enter a username of 1–255 characters without colons or line breaks." }, { status: 400 });
  }
  if (!password || Buffer.byteLength(password, "utf8") > 4096 || /[\r\n]/.test(password)) {
    return NextResponse.json({ error: "Enter a password of up to 4096 UTF-8 bytes without line breaks." }, { status: 400 });
  }
  if (!["bcrypt", "sha1", "md5"].includes(String(mode))) {
    return NextResponse.json({ error: "Choose a supported hash format." }, { status: 400 });
  }

  try {
    let hash = "";
    if (mode === "bcrypt") {
      hash = await bcrypt.hash(password, 12);
    } else if (mode === "sha1") {
      hash = "{SHA}" + createHash("sha1").update(password, "utf8").digest("base64");
    } else {
      hash = apr1(password);
    }
    return NextResponse.json({ entry: `${username}:${hash}`, mode });
  } catch {
    return NextResponse.json({ error: "Hash generation failed. Try again." }, { status: 500 });
  }
}
