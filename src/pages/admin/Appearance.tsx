import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Palette, 
  Image as ImageIcon, 
  Type, 
  Store, 
  Globe, 
  Save,
  Eye,
  X
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Moderno)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegante)' },
  { value: 'Roboto', label: 'Roboto (Limpo)' },
  { value: 'Open Sans', label: 'Open Sans (Legível)' },
  { value: 'Lato', label: 'Lato (Profissional)' },
  { value: 'Montserrat', label: 'Montserrat (Geométrico)' },
  { value: 'Poppins', label: 'Poppins (Friendly)' },
  { value: 'Merriweather', label: 'Merriweather (Clássico)' },
];

const MENU_DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compacto' },
  { value: 'normal', label: 'Normal' },
  { value: 'spacious', label: 'Espaçoso' },
];

const SORTING_OPTIONS = [
  { value: 'display_order', label: 'Ordem de Exibição' },
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'price_asc', label: 'Preço (Menor para Maior)' },
  { value: 'price_desc', label: 'Preço (Maior para Menor)' },
  { value: 'popularity', label: 'Popularidade' },
];

const Appearance = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const { data: settings, isLoading: settingsLoading, refetch } = useRestaurantSettings();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const [formData, setFormData] = useState({
    // Informações do Restaurante
    restaurant_name: '',
    tagline: '',
    description: '',
    
    // Endereço
    address_street: '',
    address_number: '',
    address_complement: '',
    address_city: '',
    address_state: '',
    address_country: '',
    address_postal_code: '',
    
    // Contato
    phone: '',
    whatsapp: '',
    email: '',
    
    // Redes Sociais
    instagram_url: '',
    facebook_url: '',
    tripadvisor_url: '',
    website_url: '',
    reservation_url: '',
    
    // Identidade Visual
    logo_url: '',
    cover_image_url: '',
    
    // Cores
    primary_color: '#E85D3F',
    secondary_color: '#6B8E23',
    accent_color: '#FFD700',
    
    // Fontes
    font_headings: 'Playfair Display',
    font_body: 'Inter',
    
    // Configurações do Menu
    show_prices: true,
    show_images: true,
    menu_density: 'normal',
    default_sorting: 'display_order',
    default_language: 'pt',
    active_languages: ['pt'] as string[],
    
    // SEO
    meta_title: '',
    meta_description: '',
    meta_keywords: [] as string[],
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
        restaurant_name: settings.restaurant_name || '',
        tagline: settings.tagline || '',
        description: settings.description || '',
        address_street: settings.address_street || '',
        address_number: settings.address_number || '',
        address_complement: settings.address_complement || '',
        address_city: settings.address_city || '',
        address_state: settings.address_state || '',
        address_country: settings.address_country || '',
        address_postal_code: settings.address_postal_code || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        instagram_url: settings.instagram_url || '',
        facebook_url: settings.facebook_url || '',
        tripadvisor_url: settings.tripadvisor_url || '',
        website_url: settings.website_url || '',
        reservation_url: settings.reservation_url || '',
        logo_url: settings.logo_url || '',
        cover_image_url: settings.cover_image_url || '',
        primary_color: settings.primary_color || '#E85D3F',
        secondary_color: settings.secondary_color || '#6B8E23',
        accent_color: settings.accent_color || '#FFD700',
        font_headings: settings.font_headings || 'Playfair Display',
        font_body: settings.font_body || 'Inter',
        show_prices: settings.show_prices ?? true,
        show_images: settings.show_images ?? true,
        menu_density: settings.menu_density || 'normal',
        default_sorting: settings.default_sorting || 'display_order',
        default_language: settings.default_language || 'pt',
        active_languages: settings.active_languages || ['pt'],
        meta_title: settings.meta_title || '',
        meta_description: settings.meta_description || '',
        meta_keywords: settings.meta_keywords || [],
      });
    }
  }, [settings]);

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    if (type === 'logo') {
      setUploadingLogo(true);
    } else {
      setUploadingCover(true);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const folder = type === 'logo' ? 'logos' : 'covers';
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message.includes('Bucket') || uploadError.message.includes('not found')) {
          toast.warning('Bucket de imagens não configurado. Use uma URL de imagem externa.');
        } else {
          toast.error('Erro ao fazer upload: ' + uploadError.message);
        }
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      if (type === 'logo') {
        setFormData({ ...formData, logo_url: publicUrl });
      } else {
        setFormData({ ...formData, cover_image_url: publicUrl });
      }

      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingCover(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!settings?.id) {
        toast.error('Configurações não encontradas');
        setLoading(false);
        return;
      }

      if (!formData.restaurant_name || formData.restaurant_name.trim().length === 0) {
        toast.error('O nome do restaurante é obrigatório');
        setLoading(false);
        return;
      }

      const updateData = {
        restaurant_name: formData.restaurant_name,
        tagline: formData.tagline || null,
        description: formData.description || null,
        address_street: formData.address_street || null,
        address_number: formData.address_number || null,
        address_complement: formData.address_complement || null,
        address_city: formData.address_city || null,
        address_state: formData.address_state || null,
        address_country: formData.address_country || null,
        address_postal_code: formData.address_postal_code || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        instagram_url: formData.instagram_url || null,
        facebook_url: formData.facebook_url || null,
        tripadvisor_url: formData.tripadvisor_url || null,
        website_url: formData.website_url || null,
        reservation_url: formData.reservation_url || null,
        logo_url: formData.logo_url || null,
        cover_image_url: formData.cover_image_url || null,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        font_headings: formData.font_headings,
        font_body: formData.font_body,
        show_prices: formData.show_prices,
        show_images: formData.show_images,
        menu_density: formData.menu_density,
        default_sorting: formData.default_sorting,
        default_language: formData.default_language,
        active_languages: formData.active_languages,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        meta_keywords: formData.meta_keywords.length > 0 ? formData.meta_keywords : null,
      };

      const { error } = await supabase
        .from('restaurant_settings')
        .update(updateData)
        .eq('id', settings.id);

      if (error) {
        console.error('Erro ao salvar:', error);
        toast.error('Erro ao salvar configurações');
      } else {
        toast.success('Configurações salvas com sucesso!');
        refetch();
      }
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(Boolean);
    setFormData({ ...formData, meta_keywords: keywords });
  };

  if (!session || settingsLoading) {
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
            <h1 className="text-3xl font-bold">Aparência</h1>
            <p className="text-muted-foreground">
              Personalize a identidade visual e configurações do seu menu digital
            </p>
          </div>
          <Button
            onClick={() => window.open('/menu', '_blank')}
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Menu
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="restaurant" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="restaurant">Restaurante</TabsTrigger>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="colors">Cores</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Aba: Informações do Restaurante */}
            <TabsContent value="restaurant" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Informações do Restaurante
                  </CardTitle>
                  <CardDescription>
                    Configure as informações básicas do seu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant_name">Nome do Restaurante *</Label>
                    <Input
                      id="restaurant_name"
                      value={formData.restaurant_name}
                      onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline / Slogan</Label>
                    <Input
                      id="tagline"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="Ex: Sabores de Portugal, Brasil e Itália"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Descreva seu restaurante..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address_street">Rua</Label>
                      <Input
                        id="address_street"
                        value={formData.address_street}
                        onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_number">Número</Label>
                      <Input
                        id="address_number"
                        value={formData.address_number}
                        onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_complement">Complemento</Label>
                    <Input
                      id="address_complement"
                      value={formData.address_complement}
                      onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="address_city">Cidade</Label>
                      <Input
                        id="address_city"
                        value={formData.address_city}
                        onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_state">Estado</Label>
                      <Input
                        id="address_state"
                        value={formData.address_state}
                        onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_postal_code">CEP</Label>
                      <Input
                        id="address_postal_code"
                        value={formData.address_postal_code}
                        onChange={(e) => setFormData({ ...formData, address_postal_code: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_country">País</Label>
                    <Input
                      id="address_country"
                      value={formData.address_country}
                      onChange={(e) => setFormData({ ...formData, address_country: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+55 11 1234-5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="+55 11 91234-5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contato@restaurante.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Redes Sociais e Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="website_url">Website</Label>
                      <Input
                        id="website_url"
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                        placeholder="https://www.restaurante.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reservation_url">Link de Reservas</Label>
                      <Input
                        id="reservation_url"
                        type="url"
                        value={formData.reservation_url}
                        onChange={(e) => setFormData({ ...formData, reservation_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram_url">Instagram</Label>
                      <Input
                        id="instagram_url"
                        type="url"
                        value={formData.instagram_url}
                        onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                        placeholder="https://instagram.com/restaurante"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook_url">Facebook</Label>
                      <Input
                        id="facebook_url"
                        type="url"
                        value={formData.facebook_url}
                        onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                        placeholder="https://facebook.com/restaurante"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tripadvisor_url">TripAdvisor</Label>
                      <Input
                        id="tripadvisor_url"
                        type="url"
                        value={formData.tripadvisor_url}
                        onChange={(e) => setFormData({ ...formData, tripadvisor_url: e.target.value })}
                        placeholder="https://tripadvisor.com/..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Identidade Visual */}
            <TabsContent value="visual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Logo do Restaurante
                  </CardTitle>
                  <CardDescription>
                    Faça upload do logo do seu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">URL do Logo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logo_url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://exemplo.com/logo.png"
                      />
                      <label className="cursor-pointer">
                        <Button type="button" variant="outline" disabled={uploadingLogo} asChild>
                          <span>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {uploadingLogo ? 'Enviando...' : 'Upload'}
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'logo');
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.logo_url && (
                      <div className="relative inline-block mt-2">
                        <img
                          src={formData.logo_url}
                          alt="Logo preview"
                          className="h-24 w-auto object-contain rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => setFormData({ ...formData, logo_url: '' })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Imagem de Capa</CardTitle>
                  <CardDescription>
                    Imagem que aparece no topo do menu digital
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cover_image_url">URL da Imagem de Capa</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cover_image_url"
                        value={formData.cover_image_url}
                        onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                        placeholder="https://exemplo.com/capa.jpg"
                      />
                      <label className="cursor-pointer">
                        <Button type="button" variant="outline" disabled={uploadingCover} asChild>
                          <span>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {uploadingCover ? 'Enviando...' : 'Upload'}
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'cover');
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.cover_image_url && (
                      <div className="relative inline-block mt-2">
                        <img
                          src={formData.cover_image_url}
                          alt="Capa preview"
                          className="h-48 w-full max-w-md object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => setFormData({ ...formData, cover_image_url: '' })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Cores */}
            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Paleta de Cores
                  </CardTitle>
                  <CardDescription>
                    Personalize as cores do seu menu digital
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-3">
                      <Label htmlFor="primary_color">Cor Primária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="h-12 w-20 p-1"
                        />
                        <Input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          placeholder="#E85D3F"
                          className="flex-1"
                        />
                      </div>
                      <div 
                        className="h-16 rounded-md border"
                        style={{ backgroundColor: formData.primary_color }}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="secondary_color">Cor Secundária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="h-12 w-20 p-1"
                        />
                        <Input
                          type="text"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          placeholder="#6B8E23"
                          className="flex-1"
                        />
                      </div>
                      <div 
                        className="h-16 rounded-md border"
                        style={{ backgroundColor: formData.secondary_color }}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="accent_color">Cor de Destaque</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accent_color"
                          type="color"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          className="h-12 w-20 p-1"
                        />
                        <Input
                          type="text"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          placeholder="#FFD700"
                          className="flex-1"
                        />
                      </div>
                      <div 
                        className="h-16 rounded-md border"
                        style={{ backgroundColor: formData.accent_color }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Fontes
                  </CardTitle>
                  <CardDescription>
                    Escolha as fontes para títulos e textos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="font_headings">Fonte dos Títulos</Label>
                      <Select
                        value={formData.font_headings}
                        onValueChange={(value) => setFormData({ ...formData, font_headings: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p 
                        className="text-2xl font-bold mt-2"
                        style={{ fontFamily: formData.font_headings }}
                      >
                        Exemplo de Título
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="font_body">Fonte do Corpo</Label>
                      <Select
                        value={formData.font_body}
                        onValueChange={(value) => setFormData({ ...formData, font_body: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p 
                        className="text-base mt-2"
                        style={{ fontFamily: formData.font_body }}
                      >
                        Exemplo de texto do corpo. Esta é a fonte que será usada para descrições e textos gerais do menu.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: Configurações do Menu */}
            <TabsContent value="menu" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Exibição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show_prices">Exibir Preços</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostrar preços dos itens no menu
                      </p>
                    </div>
                    <Switch
                      id="show_prices"
                      checked={formData.show_prices}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_prices: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show_images">Exibir Imagens</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostrar imagens dos itens no menu
                      </p>
                    </div>
                    <Switch
                      id="show_images"
                      checked={formData.show_images}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_images: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Layout do Menu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="menu_density">Densidade do Menu</Label>
                      <Select
                        value={formData.menu_density}
                        onValueChange={(value) => setFormData({ ...formData, menu_density: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MENU_DENSITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default_sorting">Ordenação Padrão</Label>
                      <Select
                        value={formData.default_sorting}
                        onValueChange={(value) => setFormData({ ...formData, default_sorting: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SORTING_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba: SEO */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEO e Meta Tags</CardTitle>
                  <CardDescription>
                    Configure as informações para motores de busca
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Título da Página (Meta Title)</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="Menu Digital - Nome do Restaurante"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.meta_title.length}/60 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Descrição (Meta Description)</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={3}
                      placeholder="Descrição do seu restaurante para motores de busca..."
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.meta_description.length}/160 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_keywords">Palavras-chave (separadas por vírgula)</Label>
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords.join(', ')}
                      onChange={(e) => handleKeywordsChange(e.target.value)}
                      placeholder="restaurante, comida italiana, menu digital, etc."
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.meta_keywords.length} palavra(s)-chave
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Todas as Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Appearance;

