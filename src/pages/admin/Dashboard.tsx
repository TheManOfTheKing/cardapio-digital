import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Package, Layers, TrendingUp } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { QRCodeGenerator } from '@/components/admin/QRCodeGenerator';
import { SeedDataButton } from '@/components/admin/SeedDataButton';

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalViews: 0,
    activeItems: 0,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate('/admin/login');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const [itemsResult, categoriesResult, viewsResult] = await Promise.all([
        supabase.from('menu_items').select('id, status', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact' }),
        supabase.from('menu_items').select('views_count'),
      ]);

      const totalViews = viewsResult.data?.reduce((sum: number, item: any) => sum + (item.views_count || 0), 0) || 0;
      const activeItems = itemsResult.data?.filter((item: any) => item.status === 'available').length || 0;

      setStats({
        totalItems: itemsResult.count || 0,
        totalCategories: categoriesResult.count || 0,
        totalViews,
        activeItems,
      });
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  if (!session) {
    return null;
  }

  const statCards = [
    {
      title: 'Total de Itens',
      value: stats.totalItems,
      icon: Package,
      description: `${stats.activeItems} disponíveis`,
      color: 'text-blue-600',
    },
    {
      title: 'Categorias',
      value: stats.totalCategories,
      icon: Layers,
      description: 'Categorias ativas',
      color: 'text-green-600',
    },
    {
      title: 'Visualizações',
      value: stats.totalViews,
      icon: Eye,
      description: 'Total de visualizações',
      color: 'text-purple-600',
    },
    {
      title: 'Taxa de Disponibilidade',
      value: stats.totalItems > 0 ? `${Math.round((stats.activeItems / stats.totalItems) * 100)}%` : '0%',
      icon: TrendingUp,
      description: 'Itens disponíveis',
      color: 'text-orange-600',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu menu digital
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Painel Administrativo</CardTitle>
            <CardDescription>
              Gerencie seu menu digital, traduções e configurações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Gestão de Conteúdo</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Adicione e edite categorias do menu</li>
                  <li>• Gerencie itens e seus detalhes</li>
                  <li>• Faça upload de imagens de alta qualidade</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Traduções</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Traduza automaticamente todo o menu</li>
                  <li>• Revise e edite traduções manualmente</li>
                  <li>• Ative/desative idiomas disponíveis</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Personalização</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Personalize cores e fontes</li>
                  <li>• Faça upload do logo do restaurante</li>
                  <li>• Configure informações de contato</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">QR Code</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gere QR Code para o menu</li>
                  <li>• Baixe em alta resolução</li>
                  <li>• Imprima para suas mesas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid com QR Code e Seed Data */}
        <div className="grid gap-6 lg:grid-cols-2">
          <QRCodeGenerator />
          <SeedDataButton />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
