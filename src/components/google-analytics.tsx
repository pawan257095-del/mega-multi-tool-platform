"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: IArguments[] | unknown[];
    gtag?: (...args: unknown[]) => void;
    addEventListener(type: "toolbox:tool-use", listener: (event: Event) => void): void;
  }
}

function sendEvent(name: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  const queue = window.dataLayer ?? (window.dataLayer = []);
  if (typeof window.gtag === "function") window.gtag("event", name, params);
  else queue.push(["event", name, params]);
}

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return;

    const pagePath = pathname;
    sendEvent("page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
    });

    if (pathname.startsWith("/tools/")) {
      const toolSlug = pathname.split("/").filter(Boolean).at(-1) ?? "unknown";
      sendEvent("tool_open", { tool_name: toolSlug, page_path: pathname });
    }
  }, [pathname]);

  useEffect(() => {
    if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return;

    const onToolUse = (event: Event) => {
      const detail = (event as CustomEvent<{ tool_name?: string; action?: string }>).detail ?? {};
      sendEvent("tool_use", {
        tool_name: detail.tool_name ?? window.location.pathname.split("/").filter(Boolean).at(-1) ?? "unknown",
        action: detail.action ?? "use",
        page_path: window.location.pathname,
      });
    };

    const onSearch = (event: Event) => {
      const term = (event as CustomEvent<string>).detail?.trim();
      if (term) sendEvent("search", { search_term: term });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const downloadElement = target.closest("a[download], button[data-ga-event='download_click']");
      if (!downloadElement) return;
      sendEvent("download_click", {
        element_text: (downloadElement.textContent ?? "").trim().slice(0, 100) || "download",
        file_name: downloadElement.getAttribute("download") ?? "",
        page_path: window.location.pathname,
      });
    };

    window.addEventListener("toolbox:tool-use", onToolUse);
    window.addEventListener("toolbox:search", onSearch);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("toolbox:tool-use", onToolUse);
      window.removeEventListener("toolbox:search", onSearch);
      document.removeEventListener("click", onClick);
    };
  }, []);

  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
