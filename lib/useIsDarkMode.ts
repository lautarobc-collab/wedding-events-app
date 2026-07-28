"use client";

import { useEffect, useState } from "react";

export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(query.matches);
    const listener = (event: MediaQueryListEvent) => setIsDark(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return isDark;
}
