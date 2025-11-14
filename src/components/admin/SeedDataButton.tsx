import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
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

export const SeedDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedData = async () => {
    setIsLoading(true);
    
    try {
      console.log('Chamando edge function seed-sample-data...');
      
      const { data, error } = await supabase.functions.invoke('seed-sample-data', {
        body: {},
      });

      if (error) {
        console.error('Erro na edge function:', error);
        throw error;
      }

      console.log('Resposta da edge function:', data);

      if (data?.success) {
        toast.success(data.message || 'Dados de exemplo inseridos com sucesso!', {
          description: `${data.data.categories} categorias, ${data.data.menuItems} itens e ${data.data.translations} traduções`,
        });
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
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
                <li>• Inserir 5 categorias de exemplo</li>
                <li>• Inserir 10 itens de menu de exemplo</li>
                <li>• Inserir traduções em inglês e espanhol</li>
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
            <li>• <strong>Idiomas:</strong> Português (padrão), Inglês e Espanhol</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
