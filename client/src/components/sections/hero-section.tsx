import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="relative rounded-lg overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=600&q=80"
          alt="New Collection Banner"
          className="w-full h-64 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent flex items-center">
          <div className="p-6 md:p-12 max-w-lg">
            <h1 className="text-white font-poppins text-3xl md:text-4xl font-bold mb-4">
              Summer Collection 2023
            </h1>
            <p className="text-white/90 mb-6 md:text-lg">
              Discover the latest trends with exclusive designs that redefine modern fashion.
            </p>
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white font-poppins font-medium py-2 px-6 rounded-full transition-all"
              asChild
            >
              <Link href="/products?collection=summer-2023">
                Shop Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
