import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, QrCode, Copy, Check, Sparkles, Globe } from 'lucide-react';
import { toast } from 'sonner';
import QRCodeLib from 'qrcode';
import type { Session } from '@supabase/supabase-js';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';

const QRCodePage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const { data: settings } = useRestaurantSettings();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(300);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const defaultMenuUrl = window.location.origin + '/language-selection';
  const menuUrl = customUrl || defaultMenuUrl;

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
      generateQRCode();
    }
  }, [session, menuUrl, qrSize]);

  const generateQRCode = async () => {
    try {
      if (canvasRef.current) {
        await QRCodeLib.toCanvas(canvasRef.current, menuUrl, {
          width: qrSize,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });

        const dataUrl = canvasRef.current.toDataURL('image/png');
        setQrCodeDataUrl(dataUrl);
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code');
    }
  };

  const downloadPNG = async (size: number = 2048) => {
    try {
      const tempCanvas = document.createElement('canvas');
      await QRCodeLib.toCanvas(tempCanvas, menuUrl, {
        width: size,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `menu-qrcode-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`QR Code baixado em PNG (${size}x${size}px)!`);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Erro ao baixar PNG:', error);
      toast.error('Erro ao baixar PNG');
    }
  };

  const downloadSVG = async () => {
    try {
      const svgString = await QRCodeLib.toString(menuUrl, {
        type: 'svg',
        width: 2048,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `menu-qrcode-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('QR Code baixado em SVG!');
    } catch (error) {
      console.error('Erro ao baixar SVG:', error);
      toast.error('Erro ao baixar SVG');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    toast.success('URL copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session) {
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
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <QrCode className="h-8 w-8 text-primary" strokeWidth={2.5} />
            Gerador de QR Code
          </h1>
          <p className="text-muted-foreground mt-2">
            Gere e baixe o QR Code do seu menu digital em alta resolução
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card Principal - QR Code */}
          <Card className="lg:col-span-1 border-2 border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" strokeWidth={2.5} />
                Preview do QR Code
              </CardTitle>
              <CardDescription>
                Visualize o QR Code antes de baixar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Preview */}
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-xl border-2 border-border shadow-lg">
                  <canvas ref={canvasRef} className="max-w-full h-auto" />
                </div>
              </div>

              {/* Tamanho do Preview */}
              <div className="space-y-2">
                <Label htmlFor="qrSize">Tamanho do Preview</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="qrSize"
                    type="range"
                    min="200"
                    max="500"
                    step="50"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16 text-right">{qrSize}px</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Configurações e Downloads */}
          <Card className="lg:col-span-1 border-2 border-secondary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-secondary" strokeWidth={2.5} />
                Configurações e Downloads
              </CardTitle>
              <CardDescription>
                Configure a URL e baixe em diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL Customizada */}
              <div className="space-y-2">
                <Label htmlFor="customUrl">URL Personalizada (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="customUrl"
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder={defaultMenuUrl}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyUrl}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para usar a URL padrão do menu
                </p>
              </div>

              {/* URL Atual */}
              <div className="space-y-2">
                <Label>URL Atual do QR Code</Label>
                <div className="bg-muted p-3 rounded-md border">
                  <p className="text-sm break-all font-mono text-muted-foreground">
                    {menuUrl}
                  </p>
                </div>
              </div>

              {/* Botões de Download */}
              <div className="space-y-3">
                <Label>Baixar QR Code</Label>
                <div className="grid gap-2">
                  <Button
                    onClick={() => downloadPNG(2048)}
                    variant="default"
                    className="w-full group hover:scale-[1.02] transition-all"
                  >
                    <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    PNG Alta Resolução (2048x2048)
                  </Button>
                  <Button
                    onClick={() => downloadPNG(1024)}
                    variant="outline"
                    className="w-full group hover:scale-[1.02] transition-all"
                  >
                    <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    PNG Média Resolução (1024x1024)
                  </Button>
                  <Button
                    onClick={downloadSVG}
                    variant="outline"
                    className="w-full group hover:scale-[1.02] transition-all"
                  >
                    <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                    SVG Vetorial (Escalável)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card de Informações e Dicas */}
        <Card className="border-2 border-accent/10 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader>
            <CardTitle>💡 Dicas e Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Formatos de Download</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>PNG 2048px:</strong> Ideal para impressão em alta qualidade</li>
                  <li>• <strong>PNG 1024px:</strong> Perfeito para uso digital e redes sociais</li>
                  <li>• <strong>SVG:</strong> Formato vetorial, redimensiona sem perda de qualidade</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Características Técnicas</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Correção de erros nível H (30% de redundância)</li>
                  <li>• Funciona mesmo com até 30% de dano no código</li>
                  <li>• Compatível com todos os leitores de QR Code</li>
                  <li>• Teste sempre antes de imprimir em larga escala</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Uso */}
        <Card>
          <CardHeader>
            <CardTitle>📱 Como Usar o QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <h4 className="font-semibold">Baixe o QR Code</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Escolha o formato adequado (PNG para impressão, SVG para digital)
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <h4 className="font-semibold">Imprima ou Compartilhe</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Coloque nas mesas, cardápios físicos ou compartilhe nas redes sociais
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <h4 className="font-semibold">Clientes Escaneiam</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Os clientes escaneiam com a câmera do celular e acessam o menu digital
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default QRCodePage;

