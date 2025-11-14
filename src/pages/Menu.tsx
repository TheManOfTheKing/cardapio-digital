import { useState, useEffect } from 'react';
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

