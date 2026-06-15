import { useState, useLayoutEffect, RefObject } from "react";

export function useElementDimensions(
  contentRef: RefObject<HTMLElement | null>,
  deps: unknown[],
  padX = 0,
  padY = 0
): { width: number; height: number } {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      setDimensions({
        width: el.clientWidth + padX,
        height: el.clientHeight + padY,
      });
    };
    update();

    const observer = new ResizeObserver(() => update());
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentRef, padX, padY, ...deps]);

  return dimensions;
}
