import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, TrashIcon, RefreshCw, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItem, Product, Category } from "@shared/schema";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export default function Cart() {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  // Fetch categories for display
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Helper function to get category name from categoryId
  const getCategoryName = (categoryId: number | null): string => {
    if (!categoryId || !categories) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : `Category #${categoryId}`;
  };

  // Fetch cart items
  const { 
    data: cartItems, 
    isLoading: isLoadingCart, 
    error: cartError 
  } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
  });

  // Update cart item quantity
  const updateCartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return await apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart/count'] });
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated",
      });
    },
    onError: (error) => {
      console.error("Failed to update cart:", error);
      toast({
        title: "Error",
        description: "Failed to update cart quantity. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Remove item from cart
  const removeCartItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart/count'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  });

  const handleQuantityChange = (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      updateCartMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId: number) => {
    removeCartItemMutation.mutate(itemId);
  };

  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    
    setIsApplyingPromo(true);
    // Simulate promo code application
    setTimeout(() => {
      toast({
        title: "Invalid promo code",
        description: "The promo code you entered is invalid or expired",
        variant: "destructive",
      });
      setIsApplyingPromo(false);
    }, 1000);
  };

  // Calculate cart totals
  const calculateSubtotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // Assuming 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="pt-32 md:pt-36 pb-24 bg-background">
      <div className="container mx-auto px-6">
        <h1 className="font-poppins text-2xl md:text-3xl font-semibold text-primary mb-8">
          Shopping Cart
        </h1>

        {isLoadingCart ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="mb-6">
                  <div className="bg-white p-6 rounded-lg flex flex-col sm:flex-row gap-4">
                    <Skeleton className="w-24 h-24 rounded" />
                    <div className="flex-1">
                      <Skeleton className="w-3/4 h-6 mb-2" />
                      <Skeleton className="w-1/2 h-5 mb-3" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="w-28 h-10" />
                        <Skeleton className="w-20 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <Skeleton className="w-full h-64 rounded-lg" />
            </div>
          </div>
        ) : cartError ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">Failed to load cart</h2>
            <p className="text-gray-500 mb-6">There was an error loading your cart items. Please try again.</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/cart'] })}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </div>
        ) : cartItems && cartItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {cartItems.map((item) => (
                <div key={item.id} className="mb-6">
                  <div className="bg-white p-4 md:p-6 rounded-lg flex flex-col sm:flex-row gap-4">
                    <Link href={`/products/${item.product.slug}`}>
                      <div className="w-24 h-24 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product.imageUrl || "https://placehold.co/400x400/e2e8f0/a0aec0?text=No+Image"} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <Link href={`/products/${item.product.slug}`} className="hover:text-accent">
                          <h3 className="font-medium text-primary">{item.product.name}</h3>
                        </Link>
                        <span className="font-semibold text-primary">
                          {formatPrice(item.product.price)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4">
                        Category: {getCategoryName(item.product.categoryId)}
                      </p>
                      
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none relative"
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            disabled={updateCartMutation.isPending}
                          >
                            {updateCartMutation.isPending && updateCartMutation.variables?.itemId === item.id && updateCartMutation.variables?.quantity === item.quantity - 1 ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-3 w-3 border-2 border-t-transparent border-primary animate-spin rounded-full"></div>
                              </div>
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </Button>
                          <div className="h-8 px-3 flex items-center justify-center border-y border-input min-w-[36px]">
                            {updateCartMutation.isPending && updateCartMutation.variables?.itemId === item.id ? '...' : item.quantity}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none relative"
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            disabled={updateCartMutation.isPending}
                          >
                            {updateCartMutation.isPending && updateCartMutation.variables?.itemId === item.id && updateCartMutation.variables?.quantity === item.quantity + 1 ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-3 w-3 border-2 border-t-transparent border-primary animate-spin rounded-full"></div>
                              </div>
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-gray-500 hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeCartItemMutation.isPending}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <div className="bg-white p-6 rounded-lg">
                <h2 className="font-poppins font-semibold text-lg mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <form onSubmit={handleApplyPromoCode} className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="rounded-r-none"
                      placeholder="Enter code"
                    />
                    <Button 
                      type="submit" 
                      className="rounded-l-none"
                      disabled={isApplyingPromo || !promoCode}
                    >
                      {isApplyingPromo ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                </form>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-semibold text-lg mb-6">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
                
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">
                  Proceed to Checkout
                </Button>
                
                <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                  <Truck className="h-4 w-4 mr-2" />
                  <span>Free shipping on orders over $50</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button asChild>
              <Link href="/products">
                Start Shopping
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
