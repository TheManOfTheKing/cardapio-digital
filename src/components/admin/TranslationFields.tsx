import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from 'sonner';

interface TranslationFieldsProps {
  entityType: 'category' | 'menu_item' | 'restaurant_settings';
  entityId: string;
  fieldName: 'name' | 'description' | 'tagline';
  defaultLanguage: string;
  activeLanguages: string[];
  defaultValue: string;
  label: string;
  isTextarea?: boolean;
  onTranslationChange?: (language: string, value: string) => void;
}

const LANGUAGE_FLAGS: Record<string, string> = {
  'pt': '🇵🇹',
  'en': '🇬🇧',
  'es': '🇪🇸',
  'fr': '🇫🇷',
  'it': '🇮🇹',
  'de': '🇩🇪',
};

const LANGUAGE_NAMES: Record<string, string> = {
  'pt': 'Português',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'it': 'Italiano',
  'de': 'Deutsch',
};

export const TranslationFields = ({
  entityType,
  entityId,
  fieldName,
  defaultLanguage,
  activeLanguages,
  defaultValue,
  label,
  isTextarea = false,
  onTranslationChange,
}: TranslationFieldsProps) => {
  const { getTranslation, autoTranslate, isAutoTranslating, saveTranslation } = 
    useTranslations(entityType, entityId);

  const [localTranslations, setLocalTranslations] = useState<Record<string, string>>({});

  // Load translations from cache
  useEffect(() => {
    const loaded: Record<string, string> = {};
    activeLanguages.forEach((lang) => {
      if (lang !== defaultLanguage) {
        const translation = getTranslation(lang, fieldName);
        if (translation) {
          loaded[lang] = translation;
        }
      }
    });
    setLocalTranslations(loaded);
  }, [activeLanguages, defaultLanguage, fieldName, getTranslation]);

  const handleAutoTranslate = async (targetLanguage: string) => {
    if (!defaultValue) {
      toast.error('Por favor, preencha o campo em português primeiro');
      return;
    }

    autoTranslate(
      {
        text: defaultValue,
        targetLanguage,
        entityId,
        entityType,
        fieldName,
      },
      {
        onSuccess: (data) => {
          const translated = data.translatedText;
          setLocalTranslations((prev) => ({ ...prev, [targetLanguage]: translated }));
          onTranslationChange?.(targetLanguage, translated);
          toast.success(data.cached ? 'Tradução carregada do cache' : 'Tradução gerada com sucesso!');
        },
        onError: (error) => {
          toast.error('Erro ao traduzir: ' + error.message);
        },
      }
    );
  };

  const handleManualChange = (language: string, value: string) => {
    setLocalTranslations((prev) => ({ ...prev, [language]: value }));
    onTranslationChange?.(language, value);
  };

  const handleSaveTranslation = async (language: string) => {
    const value = localTranslations[language];
    if (!value) return;

    saveTranslation(
      {
        entityType,
        entityId,
        fieldName,
        language,
        translatedText: value,
        isAutoTranslated: false,
      },
      {
        onSuccess: () => {
          toast.success('Tradução salva!');
        },
        onError: (error) => {
          toast.error('Erro ao salvar: ' + error.message);
        },
      }
    );
  };

  const otherLanguages = activeLanguages.filter((lang) => lang !== defaultLanguage);

  if (otherLanguages.length === 0) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label}</Label>
        {isTextarea ? (
          <Textarea id={fieldName} value={defaultValue} disabled />
        ) : (
          <Input id={fieldName} value={defaultValue} disabled />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs defaultValue={defaultLanguage} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${activeLanguages.length}, 1fr)` }}>
          {activeLanguages.map((lang) => (
            <TabsTrigger key={lang} value={lang}>
              <span className="mr-1">{LANGUAGE_FLAGS[lang]}</span>
              {LANGUAGE_NAMES[lang]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={defaultLanguage} className="space-y-2">
          {isTextarea ? (
            <Textarea value={defaultValue} disabled />
          ) : (
            <Input value={defaultValue} disabled />
          )}
          <p className="text-sm text-muted-foreground">Este é o idioma padrão</p>
        </TabsContent>

        {otherLanguages.map((lang) => (
          <TabsContent key={lang} value={lang} className="space-y-2">
            <div className="flex gap-2">
              {isTextarea ? (
                <Textarea
                  value={localTranslations[lang] || ''}
                  onChange={(e) => handleManualChange(lang, e.target.value)}
                  placeholder="Digite a tradução manualmente ou use tradução automática"
                />
              ) : (
                <Input
                  value={localTranslations[lang] || ''}
                  onChange={(e) => handleManualChange(lang, e.target.value)}
                  placeholder="Digite a tradução manualmente ou use tradução automática"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleAutoTranslate(lang)}
                disabled={isAutoTranslating || !defaultValue}
                title="Traduzir automaticamente"
              >
                {isAutoTranslating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
            {localTranslations[lang] && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSaveTranslation(lang)}
              >
                Salvar tradução
              </Button>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
