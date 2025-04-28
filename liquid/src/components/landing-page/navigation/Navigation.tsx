import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="w-full bg-black border-b border-gray-800">
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-16">
        <div className="flex items-center gap-8">
          <div className="bg-orange-500 p-2 rounded-md">
            <span className="font-bold text-xl">N</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/project" className="text-gray-300 hover:text-white transition">
              Project
            </Link>
            <Link to="/navigators" className="text-gray-300 hover:text-white transition">
              Navigators
            </Link>
            <Link to="/rewards" className="text-gray-300 hover:text-white transition">
              Rewards
            </Link>
            <Link to="/faq" className="text-gray-300 hover:text-white transition">
              FAQ
            </Link>
          </div>
        </div>
        <Button className="bg-transparent border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all">
          Launch Game
        </Button>
      </div>
    </nav>
  );
}