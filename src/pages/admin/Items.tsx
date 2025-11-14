import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Image as ImageIcon, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type ItemStatus = Database['public']['Tables']['menu_items']['Row']['status'];
type DietaryAttribute = Database['public']['Tables']['menu_items']['Row']['dietary_attributes'][number];

const DIETARY_ATTRIBUTES: { value: DietaryAttribute; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetariano' },
  { value: 'vegan', label: 'Vegano' },
  { value: 'gluten_free', label: 'Sem Glúten' },
  { value: 'lactose_free', label: 'Sem Lactose' },
  { value: 'spicy', label: 'Picante' },
  { value: 'organic', label: 'Orgânico' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'available', label: 'Disponível' },
  { value: 'unavailable', label: 'Indisponível' },
  { value: 'seasonal', label: 'Sazonal' },
];

const Items = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    image_url: '',
    dietary_attributes: [] as DietaryAttribute[],
    allergens: '',
    preparation_time: '',
    calories: '',
    portion_size: '',
    status: 'available' as ItemStatus,
    is_featured: false,
    display_order: 0,
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
    if (session) {
      fetchCategories();
      fetchItems();
    }
  }, [session]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      toast.error('Erro ao carregar categorias');
    } else {
      setCategories(data || []);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Erro ao carregar itens');
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `menu-items/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Se o bucket não existir, tentar criar ou usar URL direta
        if (uploadError.message.includes('Bucket') || uploadError.message.includes('not found')) {
          toast.warning('Bucket de imagens não configurado. Use uma URL de imagem externa.');
        } else {
          toast.error('Erro ao fazer upload: ' + uploadError.message);
        }
        setUploadingImage(false);
        return;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id) {
      toast.error('Selecione uma categoria');
      return;
    }

    if (!formData.name || !formData.price) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const itemData = {
      category_id: formData.category_id,
      name: formData.name,
      description: formData.description || null,
      price: Math.round(parseFloat(formData.price) * 100), // Converter para centavos
      image_url: formData.image_url || null,
      dietary_attributes: formData.dietary_attributes.length > 0 ? formData.dietary_attributes : null,
      allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()).filter(Boolean) : null,
      preparation_time: formData.preparation_time ? parseInt(formData.preparation_time) : null,
      calories: formData.calories ? parseInt(formData.calories) : null,
      portion_size: formData.portion_size || null,
      status: formData.status,
      is_featured: formData.is_featured,
      display_order: editingItem ? editingItem.display_order : items.length,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingItem.id);

      if (error) {
        toast.error('Erro ao atualizar item');
      } else {
        toast.success('Item atualizado com sucesso!');
        setDialogOpen(false);
        resetForm();
        fetchItems();
      }
    } else {
      const { error } = await supabase
        .from('menu_items')
        .insert(itemData);

      if (error) {
        toast.error('Erro ao criar item');
      } else {
        toast.success('Item criado com sucesso!');
        setDialogOpen(false);
        resetForm();
        fetchItems();
      }
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id,
      name: item.name,
      description: item.description || '',
      price: (item.price / 100).toFixed(2), // Converter de centavos para reais
      image_url: item.image_url || '',
      dietary_attributes: (item.dietary_attributes as DietaryAttribute[]) || [],
      allergens: item.allergens?.join(', ') || '',
      preparation_time: item.preparation_time?.toString() || '',
      calories: item.calories?.toString() || '',
      portion_size: item.portion_size || '',
      status: item.status,
      is_featured: item.is_featured,
      display_order: item.display_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir item');
    } else {
      toast.success('Item excluído com sucesso!');
      fetchItems();
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      name: '',
      description: '',
      price: '',
      image_url: '',
      dietary_attributes: [],
      allergens: '',
      preparation_time: '',
      calories: '',
      portion_size: '',
      status: 'available',
      is_featured: false,
      display_order: 0,
    });
    setEditingItem(null);
  };

  const toggleDietaryAttribute = (attribute: DietaryAttribute) => {
    setFormData({
      ...formData,
      dietary_attributes: formData.dietary_attributes.includes(attribute)
        ? formData.dietary_attributes.filter(a => a !== attribute)
        : [...formData.dietary_attributes, attribute],
    });
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category_id === selectedCategory);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  if (!session || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse">Carregando...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Itens do Menu</h1>
            <p className="text-muted-foreground">
              Gerencie os itens do seu menu
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do item do menu
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Categoria *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      O preço será armazenado em centavos automaticamente
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preparation_time">Tempo de Preparo (min)</Label>
                    <Input
                      id="preparation_time"
                      type="number"
                      min="0"
                      value={formData.preparation_time}
                      onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calorias</Label>
                    <Input
                      id="calories"
                      type="number"
                      min="0"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portion_size">Tamanho da Porção</Label>
                  <Input
                    id="portion_size"
                    value={formData.portion_size}
                    onChange={(e) => setFormData({ ...formData, portion_size: e.target.value })}
                    placeholder="Ex: 300g, 1 unidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" disabled={uploadingImage} asChild>
                        <span>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {uploadingImage ? 'Enviando...' : 'Upload'}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.image_url && (
                    <div className="relative inline-block mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Atributos Dietéticos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DIETARY_ATTRIBUTES.map((attr) => (
                      <div key={attr.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={attr.value}
                          checked={formData.dietary_attributes.includes(attr.value)}
                          onCheckedChange={() => toggleDietaryAttribute(attr.value)}
                        />
                        <Label htmlFor={attr.value} className="text-sm font-normal cursor-pointer">
                          {attr.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergens">Alérgenos (separados por vírgula)</Label>
                  <Input
                    id="allergens"
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    placeholder="Ex: Glúten, Lactose, Amendoim"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as ItemStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">Item em destaque</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Itens</CardTitle>
            <CardDescription>
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Destaque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{getCategoryName(item.category_id)}</TableCell>
                    <TableCell>
                      {(item.price / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === 'available'
                            ? 'default'
                            : item.status === 'unavailable'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {STATUS_OPTIONS.find(s => s.value === item.status)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.is_featured ? (
                        <Badge variant="outline">Destaque</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Items;

