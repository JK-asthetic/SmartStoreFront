import { cn } from "@/lib/utils";
import { Category } from "@shared/schema";
import { Link } from "wouter";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link href={`/products?category=${category.slug}`}>
      <div className={cn(
        "relative group rounded-lg overflow-hidden shadow-sm cursor-pointer",
        className
      )}>
        <img 
          src={category.imageUrl} 
          alt={category.name} 
          className="w-full h-72 md:h-80 object-cover transition-all group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent flex items-end">
          <div className="p-4 md:p-6 w-full">
            <h3 className="text-white font-poppins font-semibold text-xl">{category.name}</h3>
            <p className="text-white/90 text-sm mb-3">{category.description}</p>
            <div className="inline-block bg-white/20 hover:bg-white/30 text-white text-sm py-1 px-4 rounded-full backdrop-blur-sm transition-all">
              Shop Now
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
