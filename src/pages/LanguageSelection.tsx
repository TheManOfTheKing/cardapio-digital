import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Globe className="h-8 w-8 text-primary" />
            </div>
          </div>
          {settings.logo_url && (
            <div className="flex justify-center mb-4">
              <img 
                src={settings.logo_url} 
                alt={settings.restaurant_name}
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
          <CardTitle className="text-3xl font-bold">{settings.restaurant_name}</CardTitle>
          {settings.tagline && (
            <CardDescription className="text-lg">
              {settings.tagline}
            </CardDescription>
          )}
          <CardDescription className="text-base mt-4">
            Selecione o seu idioma / Select your language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {filteredLanguages.map(lang => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                size="lg"
                className="h-20 flex-col gap-2 hover:scale-105 transition-transform"
                onClick={() => handleLanguageSelect(lang.code)}
                disabled={selectedLanguage !== null}
              >
                <span className="text-3xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelection;

