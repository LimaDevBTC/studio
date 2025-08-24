import { useEffect, useState, useRef } from 'react';

// Declaração de tipo para o Calendly
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: any) => void;
    };
  }
}

interface UseCalendlyOptions {
  url: string;
  parentElementId: string;
  prefill?: {
    email?: string;
    name?: string;
  };
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function useCalendly(options: UseCalendlyOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const isInitializingRef = useRef(false);

  // Carregar o script do Calendly apenas quando necessário
  useEffect(() => {
    // Verificar se já existe um script do Calendly
    const existingScript = document.getElementById('calendly-script');
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    // Verificar se o Calendly já está disponível globalmente
    if (window.Calendly) {
      setIsLoaded(true);
      return;
    }

    // Carregar o script apenas se não estiver carregado
    if (!scriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.id = 'calendly-script';
      
      script.onload = () => {
        console.log('✅ Script do Calendly carregado com sucesso');
        setIsLoaded(true);
        scriptRef.current = script;
      };
      
      script.onerror = (error) => {
        console.error('❌ Erro ao carregar script do Calendly:', error);
        options.onError?.(new Error('Failed to load Calendly script'));
      };

      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // NÃO remover o script globalmente - pode estar sendo usado por outras páginas
      // Apenas limpar a referência
      scriptRef.current = null;
    };
  }, [options.onError]);

  // Inicializar o widget quando o script estiver carregado
  useEffect(() => {
    if (!isLoaded || !window.Calendly || isInitializingRef.current) return;

    const parentElement = document.getElementById(options.parentElementId);
    if (!parentElement) {
      console.warn('⚠️ Elemento pai não encontrado para o widget do Calendly');
      return;
    }

    // Verificar se já existe um widget
    const existingWidget = parentElement.querySelector('[data-calendly-widget]');
    if (existingWidget) {
      console.log('✅ Widget do Calendly já existe');
      setIsInitialized(true);
      return;
    }

    // Inicializar o widget
    try {
      isInitializingRef.current = true;
      
      if (window.Calendly) {
        window.Calendly.initInlineWidget({
          url: options.url,
          parentElement: parentElement,
          prefill: options.prefill,
          utm: {},
        });
        
        console.log('✅ Widget do Calendly inicializado com sucesso!');
        setIsInitialized(true);
        options.onLoad?.();
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar widget do Calendly:', error);
      options.onError?.(error as Error);
    } finally {
      isInitializingRef.current = false;
    }
  }, [isLoaded, options.url, options.parentElementId, options.prefill, options.onLoad, options.onError]);

  // Função para limpar o widget específico
  const cleanupWidget = () => {
    const parentElement = document.getElementById(options.parentElementId);
    if (parentElement) {
      const widget = parentElement.querySelector('[data-calendly-widget]');
      if (widget) {
        widget.remove();
        setIsInitialized(false);
      }
    }
  };

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      cleanupWidget();
    };
  }, []);

  return {
    isLoaded,
    isInitialized,
    cleanupWidget,
  };
}
