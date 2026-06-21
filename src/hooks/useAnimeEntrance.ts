import { useEffect, useRef } from "react";
import { animateEntrance, animateStaggered } from "@/utils/motion";

export function useAnimeEntrance(selector?: string) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return;
    }

    const main = animateEntrance(root);
    const items = selector
      ? animateStaggered(root.querySelectorAll(selector), 120)
      : null;

    return () => {
      main?.revert();
      items?.revert();
    };
  }, [selector]);

  return ref;
}
