import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@shared/schema";

export default function RecommendedSection() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', { filter: 'recommended' }],
  });
  
  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-poppins text-2xl font-semibold text-primary">Recommended For You</h2>
        <div className="hidden md:flex space-x-2">
          <Button 
            variant="secondary"
            size="icon"
            className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center text-primary transition-all"
            onClick={() => window.scrollBy({ left: -300, behavior: 'smooth' })}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="secondary"
            size="icon"
            className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center text-primary transition-all"
            onClick={() => window.scrollBy({ left: 300, behavior: 'smooth' })}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="w-full h-64 rounded-lg" />
              <Skeleton className="w-3/4 h-5 mt-4" />
              <Skeleton className="w-1/2 h-4 mt-2" />
              <div className="flex justify-between mt-2">
                <Skeleton className="w-1/4 h-5" />
                <Skeleton className="w-1/5 h-5" />
              </div>
              <Skeleton className="w-full h-10 mt-4 rounded-full" />
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load recommended products</p>
        </div>
      )}
      
      {products && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              variant="outline"
              className="border border-primary text-primary hover:bg-primary hover:text-white font-medium py-2 px-6 rounded-full transition-all"
              asChild
            >
              <Link href="/products">
                See More Products
              </Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
