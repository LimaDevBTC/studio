import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: any) => void;
    };
  }
}

export function useCalendly() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Verificar se o Calendly já está carregado
    if (window.Calendly) {
      setIsLoaded(true);
      setIsInitialized(true);
      return;
    }

    // Carregar o script do Calendly
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Script do Calendly carregado com sucesso');
      setIsLoaded(true);
      
      // Verificar se o Calendly está disponível
      const checkCalendly = () => {
        if (window.Calendly) {
          setIsInitialized(true);
          console.log('✅ Calendly inicializado e pronto para uso');
        } else {
          // Tentar novamente em 100ms
          setTimeout(checkCalendly, 100);
        }
      };
      
      checkCalendly();
    };
    
    script.onerror = () => {
      console.error('❌ Erro ao carregar script do Calendly');
      setIsLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Não remover o script para evitar problemas
    };
  }, []);

  const initWidget = (elementId: string, url: string) => {
    if (window.Calendly && isInitialized) {
      try {
        window.Calendly.initInlineWidget({
          url: url,
          parentElement: document.getElementById(elementId),
          minWidth: '320px',
          height: '700px'
        });
        console.log('✅ Widget do Calendly inicializado com sucesso');
        return true;
      } catch (error) {
        console.error('❌ Erro ao inicializar widget do Calendly:', error);
        return false;
      }
    }
    return false;
  };

  return { isLoaded, isInitialized, initWidget };
}
