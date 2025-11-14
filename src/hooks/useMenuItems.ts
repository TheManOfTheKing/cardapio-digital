import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Translation = Database['public']['Tables']['translations']['Row'];

export const useMenuItems = (language: string = 'pt') => {
  return useQuery({
    queryKey: ['menu-items', language],
    queryFn: async () => {
      // Get categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (categoriesError) throw categoriesError;

      // Get menu items
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('status', 'available')
        .order('display_order');
      
      if (itemsError) throw itemsError;

      // Get translations
      const { data: translations, error: translationsError } = await supabase
        .from('translations')
        .select('*')
        .eq('language', language);
      
      if (translationsError) throw translationsError;

      // Map translations to entities
      const translationsMap = new Map<string, string>(
        (translations as Translation[] || []).map(t => [`${t.entity_type}_${t.entity_id}_${t.field_name}`, t.translated_text])
      );

      // Apply translations to categories
      const translatedCategories = (categories as Category[] || []).map(cat => ({
        ...cat,
        name: translationsMap.get(`category_${cat.id}_name`) || cat.name,
        description: translationsMap.get(`category_${cat.id}_description`) || cat.description,
      }));

      // Apply translations to items
      const translatedItems = (items as MenuItem[] || []).map(item => ({
        ...item,
        name: translationsMap.get(`menu_item_${item.id}_name`) || item.name,
        description: translationsMap.get(`menu_item_${item.id}_description`) || item.description,
      }));

      // Group items by category
      const menuData = translatedCategories.map(category => ({
        ...category,
        items: translatedItems.filter(item => item.category_id === category.id) || [],
      }));

      return menuData;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
