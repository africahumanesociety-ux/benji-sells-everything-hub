import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ShopifyCartSidebar from "@/components/ShopifyCartSidebar";
import CartSidebar from "@/components/CartSidebar";
import { CartProvider } from "@/contexts/CartContext";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import AutoSales from "./pages/AutoSales";
import DigitalServices from "./pages/DigitalServices";
import MediaMarketing from "./pages/MediaMarketing";
import Store from "./pages/Store";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ShopifyCartSidebar />
        <CartSidebar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auto-sales" element={<AutoSales />} />
          <Route path="/digital-services" element={<DigitalServices />} />
          <Route path="/media" element={<MediaMarketing />} />
          <Route path="/store" element={<Store />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:handle" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
