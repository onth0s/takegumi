"use client";
import { useCallback, useEffect, useRef } from "react";

interface SyntheticScrollbarProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function SyntheticScrollbar({ scrollContainerRef }: SyntheticScrollbarProps) {
  const scrollThumbRef = useRef<HTMLDivElement>(null);

  const updateScrollbar = useCallback(() => {
    const container = scrollContainerRef.current;
    const thumb = scrollThumbRef.current;
    if (!container || !thumb) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollHeight <= clientHeight) {
      thumb.style.height = "0px";
      return;
    }

    const visibleRatio = clientHeight / scrollHeight;
    const trackHeight = clientHeight;
    const thumbHeight = Math.max(30, trackHeight * visibleRatio);

    const containerScrollable = scrollHeight - clientHeight;
    const thumbScrollable = trackHeight - thumbHeight;

    const scrollRatio = scrollTop / containerScrollable;
    const thumbTop = scrollRatio * thumbScrollable;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  }, [scrollContainerRef]);

  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;

    const startY = e.clientY;
    const startScrollTop = container.scrollTop;
    const { scrollHeight, clientHeight } = container;

    const visibleRatio = clientHeight / scrollHeight;
    const trackHeight = clientHeight;
    const thumbHeight = Math.max(30, trackHeight * visibleRatio);
    const containerScrollable = scrollHeight - clientHeight;
    const thumbScrollable = trackHeight - thumbHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaTop = (deltaY / thumbScrollable) * containerScrollable;
      container.scrollTop = Math.max(0, Math.min(scrollHeight - clientHeight, startScrollTop + deltaTop));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("select-none");
    };

    document.body.classList.add("select-none");
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateScrollbar);

    const resizeObserver = new ResizeObserver(() => {
      updateScrollbar();
    });

    resizeObserver.observe(container);
    const content = container.firstElementChild;
    if (content) {
      resizeObserver.observe(content);
    }

    updateScrollbar();

    return () => {
      container.removeEventListener("scroll", updateScrollbar);
      resizeObserver.disconnect();
    };
  }, [scrollContainerRef, updateScrollbar]);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/5 hover:bg-black/10 border-l border-black/5 dark:border-white/5 z-20 flex justify-center">
      <div
        ref={scrollThumbRef}
        className="w-1.5 bg-yellow-accent/40 hover:bg-yellow-accent-hover/70 cursor-pointer absolute top-0 transition-colors duration-150"
        style={{ height: 0 }}
        onMouseDown={handleThumbMouseDown}
      />
    </div>
  );
}
