import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export const QRCodeGenerator = () => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const menuUrl = window.location.origin; // URL do menu público

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      if (canvasRef.current) {
        // Gera QR Code em tamanho maior para preview
        await QRCode.toCanvas(canvasRef.current, menuUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H', // Máxima correção de erros
        });

        // Converte para data URL para preview
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setQrCodeDataUrl(dataUrl);
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code');
    }
  };

  const downloadPNG = async () => {
    try {
      // Cria um canvas temporário em alta resolução
      const tempCanvas = document.createElement('canvas');
      await QRCode.toCanvas(tempCanvas, menuUrl, {
        width: 2048, // Alta resolução para impressão
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      // Converte para blob e faz download
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
          toast.success('QR Code baixado em PNG!');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Erro ao baixar PNG:', error);
      toast.error('Erro ao baixar PNG');
    }
  };

  const downloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(menuUrl, {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Gerador de QR Code
        </CardTitle>
        <CardDescription>
          Gere e baixe o QR Code do seu menu em alta resolução
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6 items-start">
          {/* QR Code à esquerda */}
          <div className="flex justify-center md:justify-start">
            <div className="bg-white p-4 rounded-lg border-2 border-border">
              <canvas ref={canvasRef} className="max-w-[300px] h-auto" />
            </div>
          </div>

          {/* Informações à direita */}
          <div className="space-y-4">
            {/* URL do Menu */}
            <div className="space-y-2">
              <p className="text-sm font-medium">URL do Menu:</p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm break-all font-mono">{menuUrl}</p>
              </div>
            </div>

            {/* Botões de Download */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadPNG} variant="default" className="gap-2">
                <Download className="h-4 w-4" />
                Baixar PNG (2048x2048)
              </Button>
              <Button onClick={downloadSVG} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Baixar SVG (Vetorial)
              </Button>
            </div>

            {/* Dicas */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">💡 Dicas de Uso:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>PNG:</strong> Ideal para impressão e uso digital (2048x2048px)</li>
                <li>• <strong>SVG:</strong> Formato vetorial, perfeito para redimensionar sem perda de qualidade</li>
                <li>• O QR Code possui alta correção de erros (nível H)</li>
                <li>• Teste sempre antes de imprimir em larga escala</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
