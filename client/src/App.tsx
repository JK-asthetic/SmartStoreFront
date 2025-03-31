import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Account from "@/pages/account";
import Header from "@/components/layouts/header";
import Footer from "@/components/layouts/footer";
import ChatWidget from "@/components/widgets/chat-widget";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/account" component={Account} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const updateCartCount = (count: number) => setCartCount(count);
  const updateWishlistCount = (count: number) => setWishlistCount(count);
  const handleLoginStatusChange = (status: boolean) => setIsLoggedIn(status);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header 
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          isLoggedIn={isLoggedIn}
          onLoginStatusChange={handleLoginStatusChange}
        />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <ChatWidget />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
