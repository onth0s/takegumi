import Header from "./Header";
import Recents from "./Recents";
import Center from "./Center";
import Footer from "./Footer";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Main area: sidebar + center column */}
      <div className="flex flex-1 min-h-0 gap-4 p-6">
        <Recents />
        <div className="flex flex-1 flex-col items-center justify-center gap-14">
          <Header />
          <Center />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
