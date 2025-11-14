import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import LanguageSelection from "./pages/LanguageSelection";
import Menu from "./pages/Menu";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Items from "./pages/admin/Items";
import Translations from "./pages/admin/Translations";
import Appearance from "./pages/admin/Appearance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/language-selection" element={<LanguageSelection />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<Register />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/items" element={<Items />} />
          <Route path="/admin/translations" element={<Translations />} />
          <Route path="/admin/appearance" element={<Appearance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
