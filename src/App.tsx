
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* These routes will be implemented in future updates */}
          <Route path="/games" element={<Index />} />
          <Route path="/games/:id" element={<Index />} />
          <Route path="/games/category/:category" element={<Index />} />
          <Route path="/tournaments" element={<Index />} />
          <Route path="/leaderboard" element={<Index />} />
          <Route path="/wallet" element={<Index />} />
          <Route path="/about" element={<Index />} />
          <Route path="/register" element={<Index />} />
          <Route path="/login" element={<Index />} />
          <Route path="/profile" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
