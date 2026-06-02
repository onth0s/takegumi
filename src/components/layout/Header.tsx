export default function Header() {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <h1 className="text-2xl font-semibold tracking-wider text-accent">
        竹 Takegumi
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
        Webtoon content creation with SVF export —{" "}
        <span className="text-text-primary">compose</span>,{" "}
        <span className="text-text-primary">style</span>, and{" "}
        <span className="text-text-primary">animate</span> text overlays.
      </p>
    </div>
  );
}
