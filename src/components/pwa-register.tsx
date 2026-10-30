"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // A service worker must not intercept Next.js development chunks or HMR.
    // A previously installed worker on localhost can serve stale JavaScript and
    // cause React's "Element type is invalid" runtime overlay to loop.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      );
      void caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("toolbox-pwa-"))
            .map((key) => caches.delete(key))
        )
      );
      return;
    }

    if (location.protocol === "https:" || location.hostname === "localhost") {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Toolbox offline support could not be registered.", error);
      });
    }
  }, []);

  return null;
}
