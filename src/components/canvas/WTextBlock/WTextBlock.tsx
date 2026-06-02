import type { WTextBlock as WTextBlockType } from "@/types/canvas";
import {
  DEFAULT_WTB_FONT_SIZE,
  DEFAULT_WTB_OPACITY,
  DEFAULT_WTB_TEXT_ALIGN,
} from "@/constants/canvasDefaults";

interface Props {
  block: WTextBlockType;
}

export default function WTextBlock({ block }: Props) {
  const { text, style } = block;
  return (
    <div
      style={{
        fontSize: style.fontSize != null ? `${style.fontSize}px` : `${DEFAULT_WTB_FONT_SIZE}px`,
        fontWeight: style.fontWeight,
        color: style.color,
        fontFamily: style.fontFamily,
        lineHeight: style.lineHeight,
        textAlign: style.textAlign ?? DEFAULT_WTB_TEXT_ALIGN,
        opacity: style.opacity ?? DEFAULT_WTB_OPACITY,
      }}
      className="leading-snug px-1"
    >
      {text}
    </div>
  );
}
