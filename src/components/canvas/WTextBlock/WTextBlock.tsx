import type { WTextBlock as WTextBlockType } from "@/types/canvas";

interface Props {
  block: WTextBlockType;
}

export default function WTextBlock({ block }: Props) {
  const { text, style } = block;
  return (
    <div
      style={{
        fontSize: style.fontSize != null ? `${style.fontSize}px` : undefined,
        fontWeight: style.fontWeight,
        color: style.color,
        fontFamily: style.fontFamily,
        lineHeight: style.lineHeight,
        textAlign: style.textAlign ?? "center",
      }}
      className="leading-snug px-1"
    >
      {text}
    </div>
  );
}
