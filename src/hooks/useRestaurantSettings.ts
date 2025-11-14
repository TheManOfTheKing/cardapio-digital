import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type RestaurantSettings = Database['public']['Tables']['restaurant_settings']['Row'];

export const useRestaurantSettings = () => {
  return useQuery({
    queryKey: ['restaurant-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as RestaurantSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
