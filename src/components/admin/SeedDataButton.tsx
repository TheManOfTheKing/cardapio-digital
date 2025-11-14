import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Database as DB } from '@/types/database';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type CategoryInsert = DB['public']['Tables']['categories']['Insert'];
type MenuItemInsert = DB['public']['Tables']['menu_items']['Insert'];
type TranslationInsert = DB['public']['Tables']['translations']['Insert'];

// Dados das categorias
const categoriesData = [
  { id: 1, name_pt: 'Entradas', slug: 'entradas', display_order: 1, is_active: true },
  { id: 2, name_pt: 'Pratos Principais', slug: 'pratos-principais', display_order: 2, is_active: true },
  { id: 3, name_pt: 'Pinsas Romanas', slug: 'pinsas', display_order: 3, is_active: true },
  { id: 4, name_pt: 'Sobremesas', slug: 'sobremesas', display_order: 4, is_active: true },
  { id: 5, name_pt: 'Bebidas', slug: 'bebidas', display_order: 5, is_active: true },
];

// Dados dos itens do menu
const menuItemsData = [
  { id: 1, category_id: 1, name_pt: 'Bruschetta Mista', description_pt: 'Pão italiano tostado com tomate fresco, manjericão, azeite extra virgem e queijo burrata', price: 850, is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: true, is_available: true, display_order: 1 },
  { id: 2, category_id: 1, name_pt: 'Bolinho de Bacalhau', description_pt: 'Tradicional bolinho português de bacalhau desfiado com batata, servido com molho de pimentão', price: 950, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: true, is_available: true, display_order: 2 },
  { id: 3, category_id: 1, name_pt: 'Tábua de Queijos e Enchidos', description_pt: 'Seleção de queijos portugueses e enchidos artesanais com compotas caseiras', price: 1450, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 3 },
  { id: 4, category_id: 2, name_pt: 'Bacalhau à Brás', description_pt: 'Bacalhau desfiado salteado com batata palha, ovos, cebola e azeitonas pretas', price: 1650, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: true, is_available: true, display_order: 1 },
  { id: 5, category_id: 2, name_pt: 'Picanha Brasileira', description_pt: 'Picanha grelhada ao ponto, acompanhada de arroz, feijão preto, farofa e vinagrete', price: 2250, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: true, is_featured: true, is_available: true, display_order: 2 },
  { id: 6, category_id: 2, name_pt: 'Risotto de Cogumelos', description_pt: 'Arroz arbóreo cremoso com mix de cogumelos selvagens, parmesão e trufa', price: 1450, is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 3 },
  { id: 7, category_id: 2, name_pt: 'Polvo à Lagareiro', description_pt: 'Polvo grelhado com batatas a murro, alho e azeite português', price: 2450, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 4 },
  { id: 8, category_id: 3, name_pt: 'Pinsa Margherita', description_pt: 'Molho de tomate San Marzano, mozzarella di bufala, manjericão fresco e azeite', price: 1150, is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 1 },
  { id: 9, category_id: 3, name_pt: 'Pinsa Portuguesa', description_pt: 'Molho de tomate, queijo, presunto, linguiça calabresa, cebola e azeitonas', price: 1350, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 2 },
  { id: 10, category_id: 3, name_pt: 'Pinsa Vegetariana', description_pt: 'Molho de tomate, mozzarella, berinjela, abobrinha, pimentão e rúcula', price: 1250, is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 3 },
  { id: 11, category_id: 3, name_pt: 'Pinsa Brasileira', description_pt: 'Molho de tomate, mozzarella, carne seca desfiada, catupiry e cebola caramelizada', price: 1450, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: true, is_available: true, display_order: 4 },
  { id: 12, category_id: 4, name_pt: 'Pastel de Nata', description_pt: 'Tradicional pastel de nata português com canela', price: 350, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: true, is_available: true, display_order: 1 },
  { id: 13, category_id: 4, name_pt: 'Tiramisù', description_pt: 'Clássico italiano com café espresso, mascarpone e cacau', price: 650, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 2 },
  { id: 14, category_id: 4, name_pt: 'Brigadeiro Gourmet', description_pt: 'Trio de brigadeiros artesanais: tradicional, pistache e maracujá', price: 550, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 3 },
  { id: 15, category_id: 5, name_pt: 'Vinho Verde', description_pt: 'Vinho verde português, garrafa 750ml', price: 1800, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 1 },
  { id: 16, category_id: 5, name_pt: 'Caipirinha', description_pt: 'Tradicional caipirinha brasileira com cachaça artesanal', price: 650, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 2 },
  { id: 17, category_id: 5, name_pt: 'Água Mineral', description_pt: 'Água mineral sem gás, garrafa 500ml', price: 250, is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false, is_featured: false, is_available: true, display_order: 3 },
];

// Dados das traduções
const translationsData = [
  { entity_type: 'category' as const, entity_id: 1, field_name: 'name' as const, language: 'en', translated_text: 'Starters' },
  { entity_type: 'category' as const, entity_id: 1, field_name: 'name' as const, language: 'es', translated_text: 'Entrantes' },
  { entity_type: 'category' as const, entity_id: 1, field_name: 'name' as const, language: 'fr', translated_text: 'Entrées' },
  { entity_type: 'category' as const, entity_id: 2, field_name: 'name' as const, language: 'en', translated_text: 'Main Courses' },
  { entity_type: 'category' as const, entity_id: 2, field_name: 'name' as const, language: 'es', translated_text: 'Platos Principales' },
  { entity_type: 'category' as const, entity_id: 2, field_name: 'name' as const, language: 'fr', translated_text: 'Plats Principaux' },
  { entity_type: 'category' as const, entity_id: 3, field_name: 'name' as const, language: 'en', translated_text: 'Roman Pinsas' },
  { entity_type: 'category' as const, entity_id: 3, field_name: 'name' as const, language: 'es', translated_text: 'Pinsas Romanas' },
  { entity_type: 'category' as const, entity_id: 3, field_name: 'name' as const, language: 'fr', translated_text: 'Pinsas Romaines' },
  { entity_type: 'category' as const, entity_id: 4, field_name: 'name' as const, language: 'en', translated_text: 'Desserts' },
  { entity_type: 'category' as const, entity_id: 4, field_name: 'name' as const, language: 'es', translated_text: 'Postres' },
  { entity_type: 'category' as const, entity_id: 4, field_name: 'name' as const, language: 'fr', translated_text: 'Desserts' },
  { entity_type: 'category' as const, entity_id: 5, field_name: 'name' as const, language: 'en', translated_text: 'Drinks' },
  { entity_type: 'category' as const, entity_id: 5, field_name: 'name' as const, language: 'es', translated_text: 'Bebidas' },
  { entity_type: 'category' as const, entity_id: 5, field_name: 'name' as const, language: 'fr', translated_text: 'Boissons' },
  { entity_type: 'menu_item' as const, entity_id: 1, field_name: 'name' as const, language: 'en', translated_text: 'Mixed Bruschetta' },
  { entity_type: 'menu_item' as const, entity_id: 1, field_name: 'description' as const, language: 'en', translated_text: 'Toasted Italian bread with fresh tomato, basil, extra virgin olive oil and burrata cheese' },
  { entity_type: 'menu_item' as const, entity_id: 1, field_name: 'name' as const, language: 'es', translated_text: 'Bruschetta Mixta' },
  { entity_type: 'menu_item' as const, entity_id: 1, field_name: 'description' as const, language: 'es', translated_text: 'Pan italiano tostado con tomate fresco, albahaca, aceite de oliva virgen extra y queso burrata' },
  { entity_type: 'menu_item' as const, entity_id: 4, field_name: 'name' as const, language: 'en', translated_text: 'Bacalhau à Brás' },
  { entity_type: 'menu_item' as const, entity_id: 4, field_name: 'description' as const, language: 'en', translated_text: 'Shredded codfish sautéed with straw potatoes, eggs, onion and black olives' },
  { entity_type: 'menu_item' as const, entity_id: 4, field_name: 'name' as const, language: 'es', translated_text: 'Bacalao a la Brás' },
  { entity_type: 'menu_item' as const, entity_id: 4, field_name: 'description' as const, language: 'es', translated_text: 'Bacalao desmenuzado salteado con patatas paja, huevos, cebolla y aceitunas negras' },
];

export const SeedDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedData = async () => {
    setIsLoading(true);
    
    try {
      // 1. Limpar dados existentes (em ordem reversa devido a foreign keys)
      toast.info('Limpando dados existentes...');
      
      // Buscar todos os IDs para deletar
      const { data: allTranslations } = await supabase.from('translations').select('id');
      if (allTranslations && allTranslations.length > 0) {
        const { error: deleteTranslationsError } = await supabase
          .from('translations')
          .delete()
          .in('id', allTranslations.map(t => t.id));
        if (deleteTranslationsError) throw deleteTranslationsError;
      }
      
      const { data: allItems } = await supabase.from('menu_items').select('id');
      if (allItems && allItems.length > 0) {
        const { error: deleteItemsError } = await supabase
          .from('menu_items')
          .delete()
          .in('id', allItems.map(i => i.id));
        if (deleteItemsError) throw deleteItemsError;
      }
      
      const { data: allCategories } = await supabase.from('categories').select('id');
      if (allCategories && allCategories.length > 0) {
        const { error: deleteCategoriesError } = await supabase
          .from('categories')
          .delete()
          .in('id', allCategories.map(c => c.id));
        if (deleteCategoriesError) throw deleteCategoriesError;
      }

      // 2. Inserir categorias
      toast.info('Inserindo categorias...');
      const categoriesToInsert: CategoryInsert[] = categoriesData.map(cat => ({
        name: cat.name_pt,
        slug: cat.slug,
        display_order: cat.display_order,
        is_active: cat.is_active,
        description: null,
        icon: null,
        image_url: null,
      }));

      const { data: insertedCategories, error: categoriesError } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();

      if (categoriesError) throw categoriesError;

      // Criar mapa de IDs antigos para novos UUIDs
      const categoryIdMap = new Map<number, string>();
      categoriesData.forEach((oldCat, index) => {
        if (insertedCategories && insertedCategories[index]) {
          categoryIdMap.set(oldCat.id, insertedCategories[index].id);
        }
      });

      // 3. Inserir itens do menu
      toast.info('Inserindo itens do menu...');
      const itemsToInsert: MenuItemInsert[] = menuItemsData.map(item => {
        const dietaryAttributes: string[] = [];
        if (item.is_vegetarian) dietaryAttributes.push('vegetarian');
        if (item.is_vegan) dietaryAttributes.push('vegan');
        if (item.is_gluten_free) dietaryAttributes.push('gluten_free');
        if (item.is_spicy) dietaryAttributes.push('spicy');

        return {
          category_id: categoryIdMap.get(item.category_id) || '',
          name: item.name_pt,
          description: item.description_pt || null,
          price: item.price,
          image_url: null,
          images: null,
          dietary_attributes: dietaryAttributes.length > 0 ? dietaryAttributes as any : null,
          allergens: null,
          preparation_time: null,
          calories: null,
          portion_size: null,
          status: item.is_available ? 'available' : 'unavailable',
          is_featured: item.is_featured,
          display_order: item.display_order,
          views_count: 0,
        };
      });

      const { data: insertedItems, error: itemsError } = await supabase
        .from('menu_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      // Criar mapa de IDs antigos para novos UUIDs dos itens
      const itemIdMap = new Map<number, string>();
      menuItemsData.forEach((oldItem, index) => {
        if (insertedItems && insertedItems[index]) {
          itemIdMap.set(oldItem.id, insertedItems[index].id);
        }
      });

      // 4. Inserir traduções
      toast.info('Inserindo traduções...');
      const translationsToInsert: TranslationInsert[] = translationsData.map(trans => {
        const entityId = trans.entity_type === 'category' 
          ? categoryIdMap.get(trans.entity_id)
          : itemIdMap.get(trans.entity_id);

        if (!entityId) return null;

        return {
          entity_type: trans.entity_type,
          entity_id: entityId,
          field_name: trans.field_name,
          language: trans.language,
          translated_text: trans.translated_text,
          is_auto_translated: false,
          translation_quality: null,
          translation_service: null,
        };
      }).filter((t): t is TranslationInsert => t !== null);

      const { error: translationsError } = await supabase
        .from('translations')
        .insert(translationsToInsert);

      if (translationsError) throw translationsError;

      toast.success('Dados inseridos com sucesso!', {
        description: `${categoriesData.length} categorias, ${menuItemsData.length} itens e ${translationsToInsert.length} traduções`,
      });
    } catch (error: any) {
      console.error('Erro ao popular dados:', error);
      toast.error('Erro ao popular dados de exemplo', {
        description: error.message || 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Dados de Exemplo
        </CardTitle>
        <CardDescription>
          Popule o banco de dados com categorias, itens e traduções de exemplo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                ⚠️ Atenção: Esta ação irá:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 ml-4">
                <li>• <strong>Deletar todos os dados existentes</strong> (categorias, itens e traduções)</li>
                <li>• Inserir {categoriesData.length} categorias de exemplo</li>
                <li>• Inserir {menuItemsData.length} itens de menu de exemplo</li>
                <li>• Inserir traduções em inglês, espanhol e francês</li>
              </ul>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="default" 
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Populando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Popular Dados de Exemplo
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá deletar <strong>todos os dados existentes</strong> no banco de dados 
                e substituí-los pelos dados de exemplo. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSeedData}>
                Sim, popular dados
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">📝 Dados que serão inseridos:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Categorias:</strong> Entradas, Pratos Principais, Pinsas Romanas, Sobremesas, Bebidas</li>
            <li>• <strong>Itens:</strong> Bruschetta, Bacalhau à Brás, Risotto, Pinsa Margherita, Tiramisu, e mais</li>
            <li>• <strong>Idiomas:</strong> Português (padrão), Inglês, Espanhol e Francês</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
