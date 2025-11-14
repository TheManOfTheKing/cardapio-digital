import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft } from 'lucide-react';

const REGISTRATION_CODE = 'CARDAPIO2025';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar código
      if (code !== REGISTRATION_CODE) {
        toast.error('Código de registro inválido');
        setLoading(false);
        return;
      }

      // Validar senhas
      if (password !== confirmPassword) {
        toast.error('As senhas não coincidem');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        return;
      }

      // Validar nome
      if (!name || name.trim().length === 0) {
        toast.error('O nome é obrigatório');
        setLoading(false);
        return;
      }

      // Criar usuário
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Usuário criado com sucesso! Verifique seu email para confirmar a conta.');
        // Limpar formulário
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setCode('');
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Cadastro de Usuário</CardTitle>
          <CardDescription>
            Crie uma conta para acessar o painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Registro</Label>
              <Input
                id="code"
                type="text"
                placeholder="Digite o código de acesso"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Você precisa do código de registro para criar uma conta
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@restaurante.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t">
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/admin/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para o Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

