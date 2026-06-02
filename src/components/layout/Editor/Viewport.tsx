export default function Viewport() {
  return (
    <div className="flex-1 bg-grid flex items-center justify-center">
      <WProject />
    </div>
  );
}

function WProject() {
  return <div className="w-4/5 bg-white h-full" />;
}
