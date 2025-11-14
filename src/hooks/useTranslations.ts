import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Translation = Database['public']['Tables']['translations']['Row'];

interface TranslateParams {
  text: string;
  targetLanguage: string;
  entityId: string;
  entityType: 'category' | 'menu_item' | 'restaurant_settings';
  fieldName: 'name' | 'description' | 'tagline';
}

interface SaveTranslationParams {
  entityType: 'category' | 'menu_item' | 'restaurant_settings';
  entityId: string;
  fieldName: 'name' | 'description' | 'tagline';
  language: string;
  translatedText: string;
  isAutoTranslated?: boolean;
}

export const useTranslations = (entityType: string, entityId: string) => {
  const queryClient = useQueryClient();

  // Fetch translations for an entity
  const { data: translations, isLoading } = useQuery({
    queryKey: ['translations', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);
      
      if (error) throw error;
      return data as Translation[];
    },
    enabled: !!entityId,
  });

  // Auto-translate using edge function
  const autoTranslateMutation = useMutation({
    mutationFn: async (params: TranslateParams) => {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', entityType, entityId] });
    },
  });

  // Save or update manual translation
  const saveTranslationMutation = useMutation({
    mutationFn: async (params: SaveTranslationParams) => {
      // Check if translation exists
      const { data: existing } = await supabase
        .from('translations')
        .select('id')
        .eq('entity_type', params.entityType)
        .eq('entity_id', params.entityId)
        .eq('field_name', params.fieldName)
        .eq('language', params.language)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await (supabase as any)
          .from('translations')
          .update({
            translated_text: params.translatedText,
            is_auto_translated: params.isAutoTranslated ?? false,
          })
          .eq('id', (existing as any).id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await (supabase as any)
          .from('translations')
          .insert({
            entity_type: params.entityType,
            entity_id: params.entityId,
            field_name: params.fieldName,
            language: params.language,
            translated_text: params.translatedText,
            is_auto_translated: params.isAutoTranslated ?? false,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', entityType, entityId] });
    },
  });

  // Get translation for specific language and field
  const getTranslation = (language: string, fieldName: string): string | undefined => {
    return translations?.find(
      (t) => t.language === language && t.field_name === fieldName
    )?.translated_text;
  };

  return {
    translations,
    isLoading,
    getTranslation,
    autoTranslate: autoTranslateMutation.mutate,
    isAutoTranslating: autoTranslateMutation.isPending,
    saveTranslation: saveTranslationMutation.mutate,
    isSaving: saveTranslationMutation.isPending,
  };
};
