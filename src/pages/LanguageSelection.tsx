import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Sparkles } from 'lucide-react';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useThemeCustomization } from '@/hooks/useThemeCustomization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LANGUAGES = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

const LanguageSelection = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: settings, isLoading } = useRestaurantSettings();
  
  // Aplicar personalizações de tema
  useThemeCustomization();

  const availableLanguages = settings?.active_languages || ['pt', 'en', 'es', 'fr', 'de', 'it'];
  const filteredLanguages = LANGUAGES.filter(lang => 
    availableLanguages.includes(lang.code)
  );

  // Calcular grid dinâmico baseado no número de idiomas
  const gridCols = useMemo(() => {
    const count = filteredLanguages.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2 md:grid-cols-4';
    if (count === 5) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  }, [filteredLanguages.length]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('menu-language', languageCode);
    // Navegar para o menu após um pequeno delay para feedback visual
    setTimeout(() => {
      navigate('/menu');
    }, 300);
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-muted-foreground">
          A carregar...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background via-50% to-secondary/5 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-4xl relative z-10 shadow-2xl border-0 bg-background/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"></div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Globe className="h-8 w-8 text-primary" strokeWidth={2} />
              </div>
            </div>
          </div>
          
          {settings.logo_url && (
            <div className="flex justify-center mb-6">
              <img 
                src={settings.logo_url} 
                alt={settings.restaurant_name}
                className="h-20 w-auto object-contain drop-shadow-lg"
              />
            </div>
          )}
          
          <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {settings.restaurant_name}
          </CardTitle>
          
          {settings.tagline && (
            <CardDescription className="text-lg md:text-xl mt-2 font-medium">
              {settings.tagline}
            </CardDescription>
          )}
          
          <div className="flex items-center justify-center gap-2 mt-6">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={2.5} />
            <CardDescription className="text-base font-medium">
              Selecione o seu idioma / Select your language
            </CardDescription>
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={2.5} />
          </div>
        </CardHeader>
        
        <CardContent className="pb-8">
          {filteredLanguages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum idioma disponível no momento.</p>
            </div>
          ) : (
            <div className={`grid ${gridCols} gap-4 mt-6`}>
              {filteredLanguages.map((lang, index) => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                  size="lg"
                  className={`
                    h-24 md:h-28 flex-col gap-3 
                    transition-all duration-300 
                    hover:scale-105 hover:shadow-lg
                    ${selectedLanguage === lang.code 
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                      : 'hover:bg-primary/5 hover:border-primary/30'
                    }
                    ${selectedLanguage !== null && selectedLanguage !== lang.code ? 'opacity-50' : ''}
                  `}
                  onClick={() => handleLanguageSelect(lang.code)}
                  disabled={selectedLanguage !== null}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="text-4xl md:text-5xl drop-shadow-sm">{lang.flag}</span>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
                      {lang.code}
                    </span>
                    <span className="text-sm md:text-base font-semibold">{lang.name}</span>
                  </div>
                  {selectedLanguage === lang.code && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-primary opacity-20"></div>
                    </div>
                  )}
                </Button>
              ))}
            </div>
          )}
          
          {selectedLanguage && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground animate-pulse">
                Carregando menu...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelection;

