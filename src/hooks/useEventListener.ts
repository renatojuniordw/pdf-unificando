"use client";

import { useEffect } from "react";

export function useEventListener(
  target: EventTarget | null,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    if (!target) return;

    target.addEventListener(type, listener, options);
    return () => target.removeEventListener(type, listener, options);
  }, [target, type, listener, options]);
}
