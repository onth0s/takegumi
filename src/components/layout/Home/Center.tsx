export default function Center() {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Drop zone */}
      <div className="group flex flex-col items-center justify-center gap-2 w-full h-64 border-2 border-dashed border-border-default rounded-xl bg-background cursor-pointer transition-colors duration-200 hover:border-accent/50 hover:bg-accent/5 px-6 text-center">
        <p className="text-base text-text-secondary group-hover:text-accent transition-colors duration-200">
          Drop images here
        </p>
        <p className="text-xs text-text-tertiary">or click to browse</p>
      </div>

      {/* Secondary import options */}
      <p className="text-xs text-text-tertiary">
        Or import a{" "}
        <span className="text-text-secondary hover:text-accent cursor-pointer transition-colors duration-150">
          project JSON
        </span>{" "}
        or{" "}
        <span className="text-text-secondary hover:text-accent cursor-pointer transition-colors duration-150">
          Markdown script
        </span>
      </p>
    </div>
  );
}
