import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  display_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  dietary_info: {
    is_vegetarian?: boolean;
    is_vegan?: boolean;
    is_gluten_free?: boolean;
    is_spicy?: boolean;
  };
  is_featured: boolean;
  status: string;
  display_order: number;
}

interface Translation {
  entity_type: string;
  entity_id: number;
  field_name: string;
  language: string;
  translated_text: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting sample data seeding...');

    // Sample Categories
    const categories: Category[] = [
      { id: 1, name: 'Entradas', description: null, slug: 'entradas', display_order: 1, is_active: true },
      { id: 2, name: 'Pratos Principais', description: null, slug: 'pratos-principais', display_order: 2, is_active: true },
      { id: 3, name: 'Pinsas Romanas', description: null, slug: 'pinsas', display_order: 3, is_active: true },
      { id: 4, name: 'Sobremesas', description: null, slug: 'sobremesas', display_order: 4, is_active: true },
      { id: 5, name: 'Bebidas', description: null, slug: 'bebidas', display_order: 5, is_active: true },
    ];

    // Sample Menu Items
    const menuItems: MenuItem[] = [
      {
        id: 1,
        category_id: 1,
        name: 'Bruschetta Mista',
        description: 'Pão italiano tostado com tomate fresco, manjericão, azeite extra virgem e queijo burrata',
        price: 8.50,
        image_url: null,
        dietary_info: { is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false },
        is_featured: true,
        status: 'available',
        display_order: 1,
      },
      {
        id: 2,
        category_id: 1,
        name: 'Bolinho de Bacalhau',
        description: 'Tradicional bolinho português de bacalhau desfiado com batata, servido com molho de pimentão',
        price: 9.50,
        image_url: null,
        dietary_info: { is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false },
        is_featured: true,
        status: 'available',
        display_order: 2,
      },
      {
        id: 3,
        category_id: 1,
        name: 'Tábua de Queijos e Enchidos',
        description: 'Seleção de queijos portugueses e enchidos artesanais com compotas caseiras',
        price: 14.50,
        image_url: null,
        dietary_info: { is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false },
        is_featured: false,
        status: 'available',
        display_order: 3,
      },
      {
        id: 4,
        category_id: 2,
        name: 'Bacalhau à Brás',
        description: 'Bacalhau desfiado salteado com batata palha, ovos, cebola e azeitonas pretas',
        price: 16.50,
        image_url: null,
        dietary_info: { is_vegetarian: false, is_vegan: false, is_gluten_free: false, is_spicy: false },
        is_featured: true,
        status: 'available',
        display_order: 1,
      },
      {
        id: 5,
        category_id: 2,
        name: 'Risotto de Funghi Porcini',
        description: 'Risotto cremoso com cogumelos porcini, parmigiano reggiano e trufa',
        price: 18.00,
        image_url: null,
        dietary_info: { is_vegetarian: true, is_vegan: false, is_gluten_free: true, is_spicy: false },
        is_featured: true,
        status: 'available',
        display_order: 2,
      },
      {
        id: 6,
        category_id: 3,
        name: 'Pinsa Margherita',
        description: 'Molho de tomate San Marzano, mozzarella di bufala, manjericão fresco e azeite extra virgem',
        price: 12.00,
        image_url: null,
        dietary_info: { is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false },
        is_featured: true,
        status: 'available',
        display_order: 1,
      },
      {
        id: 7,
        category_id: 3,
        name: 'Pinsa Quattro Formaggi',
        description: 'Combinação de mozzarella, gorgonzola, parmigiano e provolone',
        price: 14.50,
        image_url: null,
        dietary_info: { is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false },
        is_featured: false,
        status: 'available',
        display_order: 2,
      },
      {
        id: 8,
        category_id: 4,
        name: 'Tiramisu Clássico',
        description: 'Sobremesa italiana com café espresso, mascarpone, cacau e biscoitos savoiardi',
        price: 7.50,
        image_url: null,
        dietary_info: { is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false },
        is_featured: true,
        status: 'available',
        display_order: 1,
      },
      {
        id: 9,
        category_id: 4,
        name: 'Pastel de Nata',
        description: 'Tradicional pastel português com creme de ovos e canela',
        price: 3.50,
        image_url: null,
        dietary_info: { is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false },
        is_featured: true,
        status: 'available',
        display_order: 2,
      },
      {
        id: 10,
        category_id: 5,
        name: 'Vinho Tinto da Casa',
        description: 'Seleção de vinhos tintos portugueses',
        price: 18.00,
        image_url: null,
        dietary_info: { is_vegetarian: true, is_vegan: true, is_gluten_free: true, is_spicy: false },
        is_featured: false,
        status: 'available',
        display_order: 1,
      },
    ];

    // Sample Translations
    const translations: Translation[] = [
      { entity_type: 'category', entity_id: 1, field_name: 'name', language: 'en', translated_text: 'Starters' },
      { entity_type: 'category', entity_id: 1, field_name: 'name', language: 'es', translated_text: 'Entrantes' },
      { entity_type: 'category', entity_id: 2, field_name: 'name', language: 'en', translated_text: 'Main Courses' },
      { entity_type: 'category', entity_id: 2, field_name: 'name', language: 'es', translated_text: 'Platos Principales' },
      { entity_type: 'category', entity_id: 3, field_name: 'name', language: 'en', translated_text: 'Roman Pinsas' },
      { entity_type: 'category', entity_id: 3, field_name: 'name', language: 'es', translated_text: 'Pinsas Romanas' },
      { entity_type: 'category', entity_id: 4, field_name: 'name', language: 'en', translated_text: 'Desserts' },
      { entity_type: 'category', entity_id: 4, field_name: 'name', language: 'es', translated_text: 'Postres' },
      { entity_type: 'category', entity_id: 5, field_name: 'name', language: 'en', translated_text: 'Drinks' },
      { entity_type: 'category', entity_id: 5, field_name: 'name', language: 'es', translated_text: 'Bebidas' },
      
      { entity_type: 'menu_item', entity_id: 1, field_name: 'name', language: 'en', translated_text: 'Mixed Bruschetta' },
      { entity_type: 'menu_item', entity_id: 1, field_name: 'description', language: 'en', translated_text: 'Toasted Italian bread with fresh tomato, basil, extra virgin olive oil and burrata cheese' },
      { entity_type: 'menu_item', entity_id: 2, field_name: 'name', language: 'en', translated_text: 'Codfish Fritters' },
      { entity_type: 'menu_item', entity_id: 2, field_name: 'description', language: 'en', translated_text: 'Traditional Portuguese fritter with shredded codfish and potato, served with pepper sauce' },
      { entity_type: 'menu_item', entity_id: 4, field_name: 'name', language: 'en', translated_text: 'Bacalhau à Brás' },
      { entity_type: 'menu_item', entity_id: 4, field_name: 'description', language: 'en', translated_text: 'Shredded codfish sautéed with straw potatoes, eggs, onion and black olives' },
      { entity_type: 'menu_item', entity_id: 8, field_name: 'name', language: 'en', translated_text: 'Classic Tiramisu' },
      { entity_type: 'menu_item', entity_id: 8, field_name: 'description', language: 'en', translated_text: 'Italian dessert with espresso coffee, mascarpone, cocoa and ladyfinger biscuits' },
    ];

    console.log('Clearing existing data...');

    // Clear existing data (in reverse order due to foreign keys)
    await supabase.from('translations').delete().neq('id', 0);
    await supabase.from('menu_items').delete().neq('id', 0);
    await supabase.from('categories').delete().neq('id', 0);

    console.log('Inserting categories...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(categories);

    if (categoriesError) {
      console.error('Error inserting categories:', categoriesError);
      throw categoriesError;
    }

    console.log('Inserting menu items...');
    const { error: itemsError } = await supabase
      .from('menu_items')
      .insert(menuItems);

    if (itemsError) {
      console.error('Error inserting menu items:', itemsError);
      throw itemsError;
    }

    console.log('Inserting translations...');
    const { error: translationsError } = await supabase
      .from('translations')
      .insert(translations);

    if (translationsError) {
      console.error('Error inserting translations:', translationsError);
      throw translationsError;
    }

    console.log('Sample data seeding completed successfully!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Dados de exemplo inseridos com sucesso!',
        data: {
          categories: categories.length,
          menuItems: menuItems.length,
          translations: translations.length,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error seeding sample data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro ao inserir dados de exemplo';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
