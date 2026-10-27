"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Toolbox offline support could not be registered.", error);
      });
    }
  }, []);
  return null;
}
