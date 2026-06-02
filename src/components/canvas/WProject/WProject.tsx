import WPanel from "../WPanel";

export default function WProject() {
  return (
    <div className="w-4/5 bg-white h-full overflow-y-auto no-scrollbar flex flex-col gap-6 p-8">
      <div className="self-start w-full max-w-lg">
        <WPanel />
      </div>
      <div className="self-end w-full max-w-lg">
        <WPanel />
      </div>
    </div>
  );
}
