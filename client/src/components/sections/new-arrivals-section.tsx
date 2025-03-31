import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@shared/schema";

export default function NewArrivalsSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', { filter: 'new' }],
  });
  
  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    
    const container = sliderRef.current;
    const scrollAmount = 300;
    const scrollLeft = direction === "left" 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth"
    });
    
    // Update scroll state after animation
    setTimeout(() => {
      if (!sliderRef.current) return;
      setCanScrollLeft(sliderRef.current.scrollLeft > 0);
      setCanScrollRight(
        sliderRef.current.scrollLeft <
        sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 10
      );
    }, 300);
  };
  
  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-poppins text-2xl font-semibold text-primary">New Arrivals</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-primary hover:text-accent focus:outline-none"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-primary hover:text-accent focus:outline-none"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="flex -mx-3 overflow-x-auto pb-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-3 min-w-[250px] md:min-w-[calc(25%-24px)]">
                <Skeleton className="w-full h-72 rounded-lg" />
                <Skeleton className="w-3/4 h-5 mt-4" />
                <Skeleton className="w-1/2 h-4 mt-2" />
                <div className="flex justify-between mt-2">
                  <Skeleton className="w-1/4 h-5" />
                  <Skeleton className="w-1/5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load products</p>
          </div>
        )}
        
        {products && products.length > 0 && (
          <div 
            ref={sliderRef}
            className="flex -mx-3 overflow-x-auto md:overflow-hidden pb-5 scrollbar-hide"
            onScroll={() => {
              if (!sliderRef.current) return;
              setCanScrollLeft(sliderRef.current.scrollLeft > 0);
              setCanScrollRight(
                sliderRef.current.scrollLeft <
                sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 10
              );
            }}
          >
            {products.map((product) => (
              <div key={product.id} className="px-3 min-w-[250px] md:min-w-[calc(25%-24px)]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
