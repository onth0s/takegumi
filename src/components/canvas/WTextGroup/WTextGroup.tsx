import WTextBlock from "../WTextBlock";

export default function WTextGroup() {
  return (
    <div className="relative p-3 bg-white/80 border border-gray-400 rounded-lg shadow-sm backdrop-blur-xs flex flex-col gap-2">
      <WTextBlock />
      <WTextBlock />
    </div>
  );
}
