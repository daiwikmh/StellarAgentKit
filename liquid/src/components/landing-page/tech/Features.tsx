import { Music, Film, Ghost, ShoppingBag, Shirt } from "lucide-react";

export default function Features() {
  return (
    <section className="container mx-auto mt-20 md:mt-32 flex flex-wrap justify-center gap-4 md:gap-8 px-4 pb-20">
      <div className="bg-purple-500 rounded-full p-8 md:p-12 flex items-center justify-center">
        <Music size={48} className="text-black" />
        <h1 className="text-4xl md:text-5xl font-bold text-black">
          10+
        </h1>
      </div>
      <div className="bg-green-500 rounded-xl p-8 md:p-12 flex items-center justify-center">
        <Film size={48} className="text-black" />
      </div>
      <div className="bg-orange-500 rounded-xl p-8 md:p-12 flex items-center justify-center">
        <Ghost size={48} className="text-black" />
      </div>
      <div className="bg-yellow-500 rounded-xl p-8 md:p-12 flex items-center justify-center">
        <ShoppingBag size={48} className="text-black" />
      </div>
      <div className="bg-blue-500 rounded-full p-8 md:p-12 flex items-center justify-center">
        <Shirt size={48} className="text-black" />
      </div>
    </section>
  );
}