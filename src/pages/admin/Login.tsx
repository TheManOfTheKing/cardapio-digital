import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, QrCode, UserPlus, Sparkles } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Login realizado com sucesso!');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background via-50% to-secondary/5 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-background/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"></div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Shield className="h-8 w-8 text-primary" strokeWidth={2} />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Painel Administrativo
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Entre com suas credenciais para acessar o painel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@restaurante.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
            <div>
              <p className="text-center text-sm text-muted-foreground mb-4 font-medium">
                Acesso público ao menu:
              </p>
              <Button 
                variant="outline" 
                className="w-full h-11 group hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]" 
                asChild
              >
                <Link to="/menu">
                  <QrCode className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  Ver Menu Digital
                </Link>
              </Button>
            </div>
            <div className="pt-4 border-t border-border/50">
              <Button 
                variant="ghost" 
                className="w-full h-11 group hover:bg-accent/50 transition-all duration-300" 
                asChild
              >
                <Link to="/admin/register">
                  <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  Criar nova conta
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <footer className="mt-10 text-center text-sm text-muted-foreground relative z-10">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <span>© 2025</span>
          <a 
            href="https://wa.me/5512982176890?text=Quero%20meu%20card%C3%A1pio%20digital..." 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-semibold transition-all hover:scale-105 inline-flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            AndréSD
          </a>
          <span className="text-muted-foreground/50">•</span>
          <span>Desenvolvido com carinho e dedicação</span>
        </p>
      </footer>
    </div>
  );
};

export default AdminLogin;
