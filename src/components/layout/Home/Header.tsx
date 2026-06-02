export default function Header() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <h1 className="text-4xl font-light tracking-wider text-accent">
        竹 Takegumi
      </h1>
      <p className="text-base text-text-secondary leading-relaxed max-w-md">
        Webtoon content creation with SVF export —{" "}
        <span className="text-text-primary">compose</span>,{" "}
        <span className="text-text-primary">style</span>, and{" "}
        <span className="text-text-primary">animate</span> text overlays.
      </p>
    </div>
  );
}
