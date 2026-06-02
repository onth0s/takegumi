import WTextGroup from "../WTextGroup";

export default function WPanel() {
  return (
    <div className="relative w-full max-w-lg aspect-[3/4] bg-gray-100 border border-gray-300 rounded shadow-md overflow-hidden p-6 flex flex-col justify-between">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-medium">
        [Panel Background Image Placeholder]
      </div>
      <div className="relative z-10 flex flex-col gap-4 h-full justify-between">
        <WTextGroup />
        <WTextGroup />
      </div>
    </div>
  );
}
