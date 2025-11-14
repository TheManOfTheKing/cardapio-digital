import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Package, Layers, TrendingUp } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { QRCodeGenerator } from '@/components/admin/QRCodeGenerator';

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string>('Administrador');
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

  useEffect(() => {
    const fetchUserName = async () => {
      if (!session?.user) {
        setUserName('Administrador');
        return;
      }
      
      // Tentar obter do user_metadata primeiro
      let metadataName = session.user.user_metadata?.name;
      
      // Se não tiver nos metadados da sessão, buscar do usuário atualizado
      if (!metadataName || metadataName.trim().length === 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          metadataName = user.user_metadata?.name;
        }
      }
      
      if (metadataName && metadataName.trim().length > 0) {
        setUserName(metadataName.trim());
      } else {
        setUserName('Administrador');
      }
    };

    if (session) {
      fetchUserName();
    }
  }, [session]);

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
        {/* Card de Boas-vindas no topo */}
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {userName}!</CardTitle>
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

        <div>
          <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>
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

        {/* QR Code Generator */}
        <QRCodeGenerator />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
