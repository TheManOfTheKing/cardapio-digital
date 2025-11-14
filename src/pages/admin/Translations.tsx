import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Globe, Key, Languages, Loader2, Sparkles } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

const AVAILABLE_LANGUAGES = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const Translations = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const { data: settings, refetch: refetchSettings } = useRestaurantSettings();
  const [loading, setLoading] = useState(false);
  const [translatingAll, setTranslatingAll] = useState(false);

  const [formData, setFormData] = useState({
    translation_api_key: '',
    translation_service: 'google',
    active_languages: ['pt'],
    default_language: 'pt',
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) navigate('/admin/login');
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate('/admin/login');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (settings) {
      setFormData({
        translation_api_key: (settings as any).translation_api_key || '',
        translation_service: (settings as any).translation_service || 'google',
        active_languages: (settings as any).active_languages || ['pt'],
        default_language: (settings as any).default_language || 'pt',
      });
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!settings?.id) {
        toast.error('Configurações não encontradas. Por favor, recarregue a página.');
        setLoading(false);
        return;
      }

      if (!formData.active_languages || formData.active_languages.length === 0) {
        toast.error('Selecione pelo menos um idioma ativo');
        setLoading(false);
        return;
      }

      if (!formData.active_languages.includes(formData.default_language)) {
        toast.error('O idioma padrão deve estar entre os idiomas ativos');
        setLoading(false);
        return;
      }

      // Preparar dados para atualização
      // Só inclui translation_api_key se foi preenchido
      const updateData: any = {
        active_languages: formData.active_languages,
        default_language: formData.default_language,
      };

      // Só adiciona translation_api_key e translation_service se a API key foi preenchida
      if (formData.translation_api_key && formData.translation_api_key.trim().length > 0) {
        updateData.translation_api_key = formData.translation_api_key.trim();
        updateData.translation_service = formData.translation_service;
      }
      // Se estiver vazio, não inclui no update (mantém o valor atual no banco)

      const { error } = await supabase
        .from('restaurant_settings')
        .update(updateData)
        .eq('id', settings.id);

      if (error) {
        console.error('Erro ao salvar:', error);
        toast.error(`Erro ao salvar configurações: ${error.message || 'Erro desconhecido'}`);
      } else {
        toast.success('Configurações salvas com sucesso!');
        refetchSettings();
      }
    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (languageCode: string, enabled: boolean) => {
    if (enabled) {
      if (!formData.active_languages.includes(languageCode)) {
        setFormData((prev) => ({
          ...prev,
          active_languages: [...prev.active_languages, languageCode],
        }));
      }
    } else {
      if (languageCode === formData.default_language) {
        toast.error('Não é possível desativar o idioma padrão');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        active_languages: prev.active_languages.filter((lang) => lang !== languageCode),
      }));
    }
  };

  const handleTranslateAll = async () => {
    if (!formData.translation_api_key) {
      toast.error('Configure a API Key primeiro');
      return;
    }

    setTranslatingAll(true);

    try {
      // Get all categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, description');

      // Get all menu items
      const { data: items } = await supabase
        .from('menu_items')
        .select('id, name, description');

      const targetLanguages = formData.active_languages.filter(
        (lang) => lang !== formData.default_language
      );

      let successCount = 0;
      let errorCount = 0;

      // Translate categories
      if (categories) {
        for (const category of categories as any[]) {
          for (const lang of targetLanguages) {
            try {
              // Check if translation already exists
              const { data: existing } = await supabase
                .from('translations')
                .select('id')
                .eq('entity_type', 'category')
                .eq('entity_id', category.id)
                .eq('language', lang)
                .maybeSingle();

              if (!existing) {
                // Translate name
                if (category.name) {
                  await supabase.functions.invoke('translate', {
                    body: {
                      text: category.name,
                      targetLanguage: lang,
                      entityId: category.id,
                      entityType: 'category',
                      fieldName: 'name',
                    },
                  });
                  successCount++;
                }

                // Translate description
                if (category.description) {
                  await supabase.functions.invoke('translate', {
                    body: {
                      text: category.description,
                      targetLanguage: lang,
                      entityId: category.id,
                      entityType: 'category',
                      fieldName: 'description',
                    },
                  });
                  successCount++;
                }
              }
            } catch (error) {
              console.error('Translation error:', error);
              errorCount++;
            }
          }
        }
      }

      // Translate menu items
      if (items) {
        for (const item of items as any[]) {
          for (const lang of targetLanguages) {
            try {
              const { data: existing } = await supabase
                .from('translations')
                .select('id')
                .eq('entity_type', 'menu_item')
                .eq('entity_id', item.id)
                .eq('language', lang)
                .maybeSingle();

              if (!existing) {
                // Translate name
                if (item.name) {
                  await supabase.functions.invoke('translate', {
                    body: {
                      text: item.name,
                      targetLanguage: lang,
                      entityId: item.id,
                      entityType: 'menu_item',
                      fieldName: 'name',
                    },
                  });
                  successCount++;
                }

                // Translate description
                if (item.description) {
                  await supabase.functions.invoke('translate', {
                    body: {
                      text: item.description,
                      targetLanguage: lang,
                      entityId: item.id,
                      entityType: 'menu_item',
                      fieldName: 'description',
                    },
                  });
                  successCount++;
                }
              }
            } catch (error) {
              console.error('Translation error:', error);
              errorCount++;
            }
          }
        }
      }

      if (errorCount > 0) {
        toast.warning(`Tradução concluída com ${errorCount} erros. ${successCount} traduções criadas.`);
      } else {
        toast.success(`${successCount} traduções criadas com sucesso!`);
      }
    } catch (error) {
      console.error('Error in translate all:', error);
      toast.error('Erro ao traduzir todo o menu');
    }

    setTranslatingAll(false);
  };

  if (!session) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Traduções e Idiomas</h1>
          <p className="text-muted-foreground">
            Configure os idiomas disponíveis e a tradução automática do menu
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configuração da API de Tradução
              </CardTitle>
              <CardDescription>
                Configure sua chave de API do Google Translate ou DeepL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="translation_service">Serviço de Tradução</Label>
                  <Select
                    value={formData.translation_service}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, translation_service: value }))
                    }
                    disabled={!formData.translation_api_key || formData.translation_api_key.trim().length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Translate</SelectItem>
                      <SelectItem value="deepl">DeepL</SelectItem>
                    </SelectContent>
                  </Select>
                  {(!formData.translation_api_key || formData.translation_api_key.trim().length === 0) && (
                    <p className="text-xs text-muted-foreground">
                      Preencha a API Key para habilitar o serviço de tradução
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="translation_api_key">API Key (Opcional)</Label>
                  <Input
                    id="translation_api_key"
                    type="password"
                    value={formData.translation_api_key}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, translation_api_key: e.target.value }))
                    }
                    placeholder="Insira sua chave de API (opcional)"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.translation_api_key && formData.translation_api_key.trim().length > 0 ? (
                      formData.translation_service === 'google' ? (
                        <>Obtenha sua chave em: <a href="https://cloud.google.com/translate" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://cloud.google.com/translate</a></>
                      ) : (
                        <>Obtenha sua chave em: <a href="https://www.deepl.com/pro-api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.deepl.com/pro-api</a></>
                      )
                    ) : (
                      'A API Key é opcional. Você pode salvar os idiomas ativos sem configurar a tradução automática.'
                    )}
                  </p>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Salvar Configurações da API
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Idiomas Ativos
              </CardTitle>
              <CardDescription>
                Selecione quais idiomas estarão disponíveis no menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-4">
                  {AVAILABLE_LANGUAGES.map((language) => (
                    <div key={language.code} className="flex items-center justify-between">
                      <Label htmlFor={`lang-${language.code}`} className="flex items-center gap-2 cursor-pointer">
                        <span className="text-2xl">{language.flag}</span>
                        <span>{language.name}</span>
                        {language.code === formData.default_language && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Padrão
                          </span>
                        )}
                      </Label>
                      <Switch
                        id={`lang-${language.code}`}
                        checked={formData.active_languages.includes(language.code)}
                        onCheckedChange={(checked) => handleLanguageToggle(language.code, checked)}
                        disabled={language.code === formData.default_language}
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Salvar Idiomas Ativos
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Tradução em Lote
            </CardTitle>
            <CardDescription>
              Traduza todo o menu automaticamente para os idiomas ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Esta ação irá traduzir automaticamente todos os itens e categorias do menu que ainda
                não possuem tradução para os idiomas ativos. Traduções já existentes não serão
                sobrescritas.
              </p>
              <Button
                onClick={handleTranslateAll}
                disabled={translatingAll || !formData.translation_api_key}
                size="lg"
              >
                {translatingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Traduzir Todo o Menu
              </Button>
              {!formData.translation_api_key && (
                <p className="text-sm text-destructive">
                  Configure a API Key primeiro para usar esta funcionalidade
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Translations;
