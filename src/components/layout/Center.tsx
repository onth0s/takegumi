export default function Center() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full space-y-4 pl-32">
      <div className="flex items-center justify-center -mt-24 w-1/3 h-1/2 border-2">
        <p>Click to add images or drag & drop them here</p>
      </div>

      <div>or import [project JSON] or [Markdown script]</div>
    </div>
  );
}
