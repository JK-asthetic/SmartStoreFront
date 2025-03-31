import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CategoryCard } from "@/components/ui/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@shared/schema";

export default function CategoriesSection() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-poppins text-2xl font-semibold text-primary">Shop by Category</h2>
        <Link href="/products" className="text-accent hover:underline">
          View all
        </Link>
      </div>
      
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden">
              <Skeleton className="w-full h-72 md:h-80" />
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load categories</p>
        </div>
      )}
      
      {categories && categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}
