import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const url = `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "accept": "application/json", "user-agent": "Mega-Multi-Tool-Platform" },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    if (response.status === 404) {
      return NextResponse.json({
        status: "not-found",
        message: "No breaches were returned by XposedOrNot for this address.",
        breachCount: 0,
        checkedAddress: email,
        provider: "XposedOrNot",
        breaches: [],
        caveat: "This is not proof the address was never exposed. Results depend on the provider's available datasets.",
      });
    }
    if (response.status === 429) {
      return NextResponse.json(
        { error: "The free breach-check service rate limit was reached. Wait before trying again." },
        { status: 429 },
      );
    }
    if (!response.ok) {
      return NextResponse.json(
        { error: `The free breach provider returned HTTP ${response.status}. Try again later.` },
        { status: 502 },
      );
    }

    const data: unknown = await response.json();
    const root = data && typeof data === "object" ? data as Record<string, unknown> : {};
    const raw = Array.isArray(root.breaches) ? root.breaches : [];
    const flattened: unknown[] = raw.flatMap((item) => Array.isArray(item) ? item : [item]);
    const names = [...new Set(flattened.filter((item): item is string => typeof item === "string" && item.trim().length > 0))];

    return NextResponse.json({
      status: names.length ? "found" : "not-found",
      message: names.length
        ? "This address appears in one or more breaches reported by the provider."
        : "No breaches were returned by XposedOrNot for this address.",
      breachCount: names.length,
      checkedAddress: email,
      provider: "XposedOrNot",
      breaches: names.map((name) => ({ name })),
      caveat: "Results only reflect the provider's available datasets and may be incomplete or outdated.",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the free breach provider. Check your server's internet connection and try again." },
      { status: 502 },
    );
  }
}
