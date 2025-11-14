import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/database';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface MenuItemCardProps {
  item: MenuItem;
  onClick?: () => void;
  showPrice?: boolean;
}

const DIETARY_ICONS: Record<string, string> = {
  vegetarian: '🌱',
  vegan: '🥗',
  gluten_free: '🌾',
  lactose_free: '🥛',
  spicy: '🌶️',
  organic: '🍃',
  halal: '☪️',
  kosher: '✡️',
};

export const MenuItemCard = ({ item, onClick, showPrice = true }: MenuItemCardProps) => {
  return (
    <Card 
      className="overflow-hidden hover:shadow-elegant transition-smooth cursor-pointer group"
      onClick={onClick}
    >
      {item.image_url && (
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
          {item.is_featured && (
            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
              Destaque
            </Badge>
          )}
        </div>
      )}
      
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
          {showPrice && (
            <span className="text-primary font-bold text-lg whitespace-nowrap">
              €{(item.price / 100).toFixed(2)}
            </span>
          )}
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
        
        {item.dietary_attributes && item.dietary_attributes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.dietary_attributes.map(attr => (
              <span 
                key={attr} 
                className="text-lg" 
                title={attr.replace('_', ' ')}
              >
                {DIETARY_ICONS[attr]}
              </span>
            ))}
          </div>
        )}
        
        {item.allergens && item.allergens.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Alergénios: {item.allergens.join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
