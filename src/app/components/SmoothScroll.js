"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 0.6,
      wheelMultiplier: 1.3,
    });

    console.log("Lenis initialized!");

    lenis.on("scroll", (e) => {
      console.log("Scrolling:", e);
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}