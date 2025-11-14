import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame } from 'lucide-react';
import type { Database } from '@/types/database';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface MenuItemDialogProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showPrice?: boolean;
}

const DIETARY_LABELS: Record<string, string> = {
  vegetarian: 'Vegetariano',
  vegan: 'Vegano',
  gluten_free: 'Sem Glúten',
  lactose_free: 'Sem Lactose',
  spicy: 'Picante',
  organic: 'Orgânico',
  halal: 'Halal',
  kosher: 'Kosher',
};

export const MenuItemDialog = ({ item, open, onOpenChange, showPrice = true }: MenuItemDialogProps) => {
  if (!item) return null;

  const images = item.images as string[] || [];
  const allImages = [item.image_url, ...images].filter(Boolean) as string[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {allImages.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {allImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${item.name} ${idx + 1}`}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {showPrice && (
              <span className="text-2xl font-bold text-primary">
                €{(item.price / 100).toFixed(2)}
              </span>
            )}
            
            <div className="flex gap-2 flex-wrap">
              {item.dietary_attributes?.map(attr => (
                <Badge key={attr} variant="secondary">
                  {DIETARY_LABELS[attr] || attr}
                </Badge>
              ))}
            </div>
          </div>
          
          {item.description && (
            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            {item.preparation_time && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{item.preparation_time} min</span>
              </div>
            )}
            
            {item.calories && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="h-4 w-4" />
                <span>{item.calories} kcal</span>
              </div>
            )}
          </div>
          
          {item.portion_size && (
            <p className="text-sm text-muted-foreground">
              Porção: {item.portion_size}
            </p>
          )}
          
          {item.allergens && item.allergens.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-1">Alergénios:</p>
              <p className="text-sm text-muted-foreground">
                {item.allergens.join(', ')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
