"use client";

import { RefObject, useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClickOutside: (event: MouseEvent) => void,
) {
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const element = ref.current;
      if (!element || element.contains(event.target as Node)) return;
      onClickOutside(event);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClickOutside, ref]);
}
