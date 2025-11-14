import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, Instagram, Facebook, Globe as GlobeIcon } from 'lucide-react';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useThemeCustomization } from '@/hooks/useThemeCustomization';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MenuCategory } from '@/components/MenuCategory';
import { MenuItemDialog } from '@/components/MenuItemDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

const Menu = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('menu-language');
    return saved || 'pt';
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryRefs = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const { data: settings, isLoading: settingsLoading } = useRestaurantSettings();
  const { data: menuData, isLoading: menuLoading } = useMenuItems(language);
  
  // Aplicar personalizações de tema
  useThemeCustomization();
  
  useEffect(() => {
    // Verificar se o idioma foi definido, caso contrário redirecionar
    const saved = localStorage.getItem('menu-language');
    if (!saved) {
      navigate('/language-selection');
      return;
    }
    localStorage.setItem('menu-language', language);
  }, [language, navigate]);
  
  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };
  
  const filteredMenuData = menuData?.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  // Get categories with items for navigation
  const categoriesWithItems = useMemo(() => {
    return filteredMenuData?.filter(cat => cat.items.length > 0) || [];
  }, [filteredMenuData]);

  // Setup Intersection Observer for scroll spy
  useEffect(() => {
    if (!categoriesWithItems.length) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Set initial active category (first one)
    if (categoriesWithItems.length > 0) {
      setActiveCategory(categoriesWithItems[0].slug);
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio that's visible
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by intersection ratio (highest first) and then by position (topmost first)
          visibleEntries.sort((a, b) => {
            if (b.intersectionRatio !== a.intersectionRatio) {
              return b.intersectionRatio - a.intersectionRatio;
            }
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });
          const topEntry = visibleEntries[0];
          if (topEntry.isIntersecting && topEntry.intersectionRatio > 0.1) {
            setActiveCategory(topEntry.target.id);
          }
        } else {
          // If no entries are visible, check scroll position
          // If at the top, set first category as active
          if (window.scrollY < 200) {
            setActiveCategory(categoriesWithItems[0]?.slug || null);
          }
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px', // Trigger when section is in the upper 40% of viewport
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    // Observe all category sections
    categoriesWithItems.forEach(category => {
      const element = document.getElementById(category.slug);
      if (element) {
        categoryRefs.current.set(category.slug, element);
        observerRef.current?.observe(element);
      }
    });

    // Handle scroll to detect when at top
    const handleScroll = () => {
      if (window.scrollY < 200) {
        const firstCategory = categoriesWithItems[0];
        if (firstCategory) {
          const element = document.getElementById(firstCategory.slug);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top > 200) {
              setActiveCategory(firstCategory.slug);
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [categoriesWithItems]);

  // Handle category navigation click
  const handleCategoryClick = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      // Calculate header height dynamically (header + category nav)
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 150;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };
  
  if (settingsLoading || menuLoading || !settings || !menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-muted-foreground">
          A carregar menu...
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {settings.logo_url && (
                <img 
                  src={settings.logo_url} 
                  alt={settings.restaurant_name}
                  className="h-12 w-auto object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{settings.restaurant_name}</h1>
                {settings.tagline && (
                  <p className="text-sm text-muted-foreground">{settings.tagline}</p>
                )}
              </div>
            </div>
            
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
              availableLanguages={settings.active_languages}
            />
          </div>
        </div>
        
        {/* Category Navigation */}
        {categoriesWithItems.length > 0 && (
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
              <nav className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
                {categoriesWithItems.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                      "hover:bg-primary/10 hover:text-primary",
                      activeCategory === category.slug
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
      
      {/* Cover Image */}
      {settings.cover_image_url && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={settings.cover_image_url}
            alt="Restaurant cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Pesquisar no menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
        
        {/* Menu Categories */}
        <div className="space-y-16">
          {filteredMenuData?.map(category => (
            <MenuCategory
              key={category.id}
              category={category}
              onItemClick={handleItemClick}
              showPrice={settings.show_prices}
            />
          ))}
        </div>
        
        {/* Restaurant Info */}
        <section className="bg-card rounded-lg p-8 shadow-card space-y-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold">Informações</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {settings.address_street && (
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.address_street}, {settings.address_number}
                    {settings.address_complement && `, ${settings.address_complement}`}
                    <br />
                    {settings.address_postal_code} {settings.address_city}
                  </p>
                </div>
              </div>
            )}
            
            {settings.phone && (
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <a 
                    href={`tel:${settings.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 pt-4 border-t">
            {settings.instagram_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            )}
            {settings.facebook_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            )}
            {settings.website_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={settings.website_url} target="_blank" rel="noopener noreferrer">
                  <GlobeIcon className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} {settings.restaurant_name}. Todos os direitos reservados.
        </div>
      </footer>
      
      <MenuItemDialog
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        showPrice={settings?.show_prices}
      />
    </div>
  );
};

export default Menu;

