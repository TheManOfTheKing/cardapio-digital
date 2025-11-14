import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Layers,
  Package,
  Languages,
  Palette,
  QrCode,
  LogOut,
  Menu,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Categorias', href: '/admin/categories', icon: Layers },
  { name: 'Itens do Menu', href: '/admin/items', icon: Package },
  { name: 'Traduções', href: '/admin/translations', icon: Languages },
  { name: 'Aparência', href: '/admin/appearance', icon: Palette },
  { name: 'QR Code', href: '/admin/qrcode', icon: QrCode },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const Sidebar = () => (
    <nav className="space-y-1.5">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent transition-all duration-200 group"
          activeClassName="bg-primary/10 text-primary font-semibold border-l-2 border-primary"
          onClick={() => setMobileMenuOpen(false)}
        >
          <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 md:h-16 items-center gap-2 md:gap-4 px-3 md:px-4 lg:px-6">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                <Menu className="h-5 w-5" strokeWidth={2.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-4">
                <div className="flex items-center gap-3 mb-6 px-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <LayoutDashboard className="h-4 w-4 text-primary" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-lg font-semibold">Menu Admin</h2>
                </div>
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
              <LayoutDashboard className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
              <span className="hidden sm:inline">Menu Digital Admin</span>
              <span className="sm:hidden">Admin</span>
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-1 md:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open('/language-selection', '_blank')}
              className="group hover:bg-primary/5 transition-all duration-200 md:h-9 md:w-auto md:px-3"
              title="Ver Menu"
            >
              <ExternalLink className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span className="hidden md:inline">Ver Menu</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="group hover:bg-destructive/5 hover:text-destructive transition-all duration-200 md:h-9 md:w-auto md:px-3"
              title="Sair"
            >
              <LogOut className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 border-r p-4">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
        
        {/* Footer */}
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 md:py-4 px-3 md:px-6">
          <div className="text-center text-xs md:text-sm text-muted-foreground">
            <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2">
              {/* Primeira linha: Copyright e nome */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                <span>© 2025</span>
                <a 
                  href="https://wa.me/5512982176890?text=Quero%20meu%20card%C3%A1pio%20digital..." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold transition-all hover:scale-105 inline-flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" strokeWidth={2.5} />
                  AndréSD
                </a>
              </div>
              {/* Segunda linha: Texto de desenvolvimento */}
              <span className="text-center leading-tight">Desenvolvido com carinho e dedicação</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
