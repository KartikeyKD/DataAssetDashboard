import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
        <SidebarProvider>

    <TooltipProvider>
      <Toaster />
      <Sonner />
                  {/* <SidebarTrigger /> */}
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
        </SidebarProvider>

  </QueryClientProvider>
);

export default App;
