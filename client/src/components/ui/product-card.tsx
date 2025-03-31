import { useState } from "react";
import { Link } from "wouter";
import { cn, formatPrice } from "@/lib/utils";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Star, ShoppingBag, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product & { categoryName?: string };
  variant?: "default" | "compact";
  className?: string;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
}

export function ProductCard({
  product,
  variant = "default",
  className,
  onAddToCart,
  onAddToWishlist
}: ProductCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    try {
      await apiRequest("POST", "/api/cart", { productId: product.id });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
      if (onAddToCart) onAddToCart();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isInWishlist) {
        await apiRequest("DELETE", `/api/wishlist/${product.id}`, undefined);
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        await apiRequest("POST", "/api/wishlist", { productId: product.id });
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      }
      setIsInWishlist(!isInWishlist);
      if (onAddToWishlist) onAddToWishlist();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    }
  };

  // Calculate discount percentage if there's an old price
  const discountPercentage = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : null;

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative">
          {/* Product image with hover effect */}
          <div className="overflow-hidden">
            <img
              src={product.imageUrl || "https://placehold.co/400x500/e2e8f0/a0aec0?text=No+Image"}
              alt={product.name}
              className={cn(
                "w-full object-cover transition-all duration-500",
                variant === "default" ? "h-72" : "h-56",
                isHovering ? "scale-110 filter brightness-90" : "scale-100"
              )}
            />
          </div>

          {/* Product badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">NEW</Badge>
            )}
            
            {product.isTrending && (
              <Badge className="bg-blue-500 text-white hover:bg-blue-600">TRENDING</Badge>
            )}
            
            {discountPercentage && discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white hover:bg-red-600">-{discountPercentage}%</Badge>
            )}
          </div>
          
          {/* Quick action buttons */}
          <div className={cn(
            "absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300",
            isHovering ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
          )}>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/90 hover:bg-white shadow-sm text-primary hover:text-secondary w-9 h-9"
              onClick={handleToggleWishlist}
            >
              <Heart className={cn("h-4 w-4", isInWishlist && "fill-red-500 text-red-500")} />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/90 hover:bg-white shadow-sm text-primary hover:text-secondary w-9 h-9"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/products/${product.slug}`;
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Add to cart button */}
          <div className={cn(
            "absolute inset-x-0 bottom-0 p-3 transform transition-all duration-300 ease-in-out",
            isHovering ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            <Button 
              variant="default" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-md shadow-md flex items-center justify-center gap-2"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingBag className="h-4 w-4" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
        
        {/* Product details */}
        <div className="p-4">
          <h3 className="font-medium text-primary text-base mb-1 truncate hover:text-secondary transition-colors">{product.name}</h3>
          
          {/* Category will be fetched and displayed in the parent component */}
          <p className="text-xs text-gray-500 mb-2 capitalize">
            {product.categoryName || (product.categoryId ? `Category #${product.categoryId}` : 'Uncategorized')}
          </p>
          
          {/* Price section */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              {product.oldPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
              <span className="font-semibold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center bg-yellow-50 rounded-full px-2 py-0.5">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-medium ml-1 text-yellow-700">{product.rating}</span>
                {product.reviewCount && product.reviewCount > 0 && (
                  <span className="text-xs text-yellow-600 ml-0.5">({product.reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
