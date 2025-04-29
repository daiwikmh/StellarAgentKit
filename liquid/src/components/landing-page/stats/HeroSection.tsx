import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="container mx-auto flex-1 pt-20 flex flex-col justify-center items-center px-4">
      <h1 className="text-6xl justify-center md:text-8xl lg:text-9xl font-bold tracking-tighter max-w-6xl mx-auto leading-tight">
        STELLAR FIRST
        <br />
        AGENTIC SDK
      </h1>
      <p className="mt-8 text-xl md:text-2xl text-gray-300">Start your stellar journey</p>
      <Button className="mt-10 bg-gradient-to-r from-green-400 to-green-500 text-black font-medium text-lg px-8 py-6 h-auto rounded-full hover:opacity-90 transition-opacity">
        <Bot/>
        Launch Agent
      </Button>
    </section>
  );
}