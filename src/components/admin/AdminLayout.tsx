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
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-4">
                <h2 className="mb-4 px-3 text-lg font-semibold">Menu Admin</h2>
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Menu Digital Admin
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/language-selection', '_blank')}
              className="group hover:bg-primary/5 transition-all duration-200"
            >
              <ExternalLink className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              Ver Menu
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="group hover:bg-destructive/5 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="flex flex-1">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 border-r p-4">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
        
        {/* Footer */}
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 px-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              <span>© 2025</span>
              <a 
                href="https://wa.me/5512982176890?text=Quero%20meu%20card%C3%A1pio%20digital..." 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                AndréSD
              </a>
              <span>•</span>
              <span>Desenvolvido com carinho e dedicação</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
