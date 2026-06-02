export default function Home() {
  return (
    <div className="relative flex flex-col h-screen items-center justify-between  pt-24 pb-6 bg-amber-800_">
      <Header />
      <Sidebar />
      <Center />
      <Footer />
    </div>
  );
}

const Header = () => {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <p>竹 Takegumi</p>
      <p>
        Webtoon content creation tool with SVF export support <br /> Compose
        text overlays, style them, animate them
      </p>
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="absolute left-8 top-16 w-1/4 h-4/5 border-2">
      <p>recents will show up here</p>
      <p>favorites, pinned</p>
      <p>or simply a message that let&apos;s you know that will be the case</p>
    </div>
  );
};

const Center = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full bg-amber-950_ space-y-4 pl-32">
      <div className="flex items-center justify-center -mt-26 w-1/3 h-1/2 border-2">
        <p>Click to add images or drag & drop them here</p>
      </div>

      <div>or import [project JSON] or [Markdown script]</div>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="flex relative justify-between w-screen px-6">
      <div>Load Demo</div>

      <p>Built for stories that move</p>

      <div className="bg-red-800">Nuke &apos;Em All</div>
    </div>
  );
};
