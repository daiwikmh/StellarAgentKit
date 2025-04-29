import { Footer } from "./navigation/Footer";
import Navbar from "./navigation/Navigation";
import { Bento } from "./stats/Bento";
import HeroSection from "./stats/HeroSection";
import Features from "./tech/Features";
import { AnimatedTextIcons } from "./tech/icons";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="container mx-auto">
        <Navbar />
      </header>

      <main className="flex-1 flex flex-col">
        <HeroSection />
        <Features/>
        <AnimatedTextIcons/>
        <Bento/>
        <Footer/>
      </main>
    </div>
  );
}