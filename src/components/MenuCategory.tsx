import { MenuItemCard } from './MenuItemCard';
import type { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface MenuCategoryProps {
  category: Category & { items: MenuItem[] };
  onItemClick: (item: MenuItem) => void;
  showPrice?: boolean;
}

export const MenuCategory = ({ category, onItemClick, showPrice }: MenuCategoryProps) => {
  if (category.items.length === 0) return null;

  return (
    <section id={category.slug} className="scroll-mt-20">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {category.icon && <span className="text-3xl">{category.icon}</span>}
          <h2 className="text-3xl font-bold">{category.name}</h2>
        </div>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.items.map(item => (
          <MenuItemCard
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
            showPrice={showPrice}
          />
        ))}
      </div>
    </section>
  );
};
