import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@shared/schema";

export default function TrendingSection() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products', { filter: 'trending' }],
  });
  
  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-poppins text-2xl font-semibold text-primary">Trending Products</h2>
        <Link href="/products?filter=trending" className="text-accent hover:underline">
          View all
        </Link>
      </div>
      
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
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
          <p className="text-destructive">Failed to load trending products</p>
        </div>
      )}
      
      {products && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
