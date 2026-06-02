export default function Footer() {
  return (
    <div className="flex items-center justify-between w-full px-6 pb-5 pt-1">
      <button className="text-sm text-accent hover:text-accent-hover cursor-pointer transition-colors duration-150">
        Load demo
      </button>

      <p className="text-xs text-text-tertiary tracking-wide">
        Built for stories that move.
      </p>

      <button className="text-sm uppercase text-danger hover:bg-danger hover:text-white px-3 py-1 -mx-3 -my-1 rounded cursor-pointer transition-colors duration-150">
        Nuke &apos;em all
      </button>
    </div>
  );
}
