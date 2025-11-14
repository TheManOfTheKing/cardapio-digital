import { useEffect, useRef } from 'react';
import { useRestaurantSettings } from './useRestaurantSettings';

// Mapeamento de fontes para Google Fonts
const GOOGLE_FONTS_MAP: Record<string, string> = {
  'Inter': 'Inter:wght@300;400;500;600;700',
  'Playfair Display': 'Playfair+Display:wght@400;600;700',
  'Roboto': 'Roboto:wght@300;400;500;700',
  'Open Sans': 'Open+Sans:wght@300;400;600;700',
  'Lato': 'Lato:wght@300;400;700',
  'Montserrat': 'Montserrat:wght@300;400;600;700',
  'Poppins': 'Poppins:wght@300;400;600;700',
  'Merriweather': 'Merriweather:wght@300;400;700',
};

// Função auxiliar para converter hex para HSL
const hexToHsl = (hex: string): string => {
  // Remove o # se presente
  hex = hex.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const useThemeCustomization = () => {
  const { data: settings } = useRestaurantSettings();
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Aplicar cores
    if (settings.primary_color) {
      const primaryHsl = hexToHsl(settings.primary_color);
      root.style.setProperty('--primary', primaryHsl);
    }

    if (settings.secondary_color) {
      const secondaryHsl = hexToHsl(settings.secondary_color);
      root.style.setProperty('--secondary', secondaryHsl);
    }

    if (settings.accent_color) {
      const accentHsl = hexToHsl(settings.accent_color);
      root.style.setProperty('--accent', accentHsl);
    }

    // Carregar fontes do Google Fonts se necessário
    const fontsToLoad = new Set<string>();
    if (settings.font_body && GOOGLE_FONTS_MAP[settings.font_body]) {
      fontsToLoad.add(GOOGLE_FONTS_MAP[settings.font_body]);
    }
    if (settings.font_headings && GOOGLE_FONTS_MAP[settings.font_headings]) {
      fontsToLoad.add(GOOGLE_FONTS_MAP[settings.font_headings]);
    }

    if (fontsToLoad.size > 0) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = `https://fonts.googleapis.com/css2?${Array.from(fontsToLoad).join('&')}&display=swap`;
      fontLink.id = 'dynamic-fonts';
      
      // Remove link anterior se existir
      const existingLink = document.getElementById('dynamic-fonts');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
      
      document.head.appendChild(fontLink);
    }

    // Aplicar fontes no body
    if (settings.font_body) {
      document.body.style.fontFamily = `"${settings.font_body}", system-ui, sans-serif`;
    }

    // Aplicar fontes nos headings
    const fontHeadings = settings.font_headings || 'Playfair Display';
    
    // Remove estilo anterior se existir
    if (styleRef.current && document.head.contains(styleRef.current)) {
      document.head.removeChild(styleRef.current);
    }

    // Cria novo estilo
    const style = document.createElement('style');
    style.id = 'theme-customization';
    style.textContent = `
      h1, h2, h3, h4, h5, h6 {
        font-family: "${fontHeadings}", Georgia, serif !important;
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;

    return () => {
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
      }
    };
  }, [settings]);
};

