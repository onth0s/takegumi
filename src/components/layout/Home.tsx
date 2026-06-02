import Header from "./Header";
import Sidebar from "./Sidebar";
import Center from "./Center";
import Footer from "./Footer";

export default function Home() {
  return (
    <div className="relative flex flex-col h-screen w-full items-center justify-between pt-24 pb-6">
      <Header />
      <Sidebar />
      <Center />
      <Footer />
    </div>
  );
}
