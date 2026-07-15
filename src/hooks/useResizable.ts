import { useRef, useState, useEffect, useCallback } from "react";

interface UseResizableOptions {
  min: number;
  max: number;
}

export function useResizable(defaultWidth: number, { min, max }: UseResizableOptions) {
  const [width, setWidth] = useState(defaultWidth);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      e.preventDefault();
    },
    [width]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      setWidth(Math.max(min, Math.min(max, startWidth.current + delta)));
    };
    const onMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [min, max]);

  return { width, onMouseDown };
}
