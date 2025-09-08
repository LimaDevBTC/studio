import { useState, useEffect, useMemo } from 'react';

interface AnimationPhase {
  name: string;
  start: number;
  duration: number;
  hexagonOpacity: number;
  castleOpacity: number;
}

export const useImperioAnimation = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hexagonOpacity, setHexagonOpacity] = useState(0);
  const [castleOpacity, setCastleOpacity] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const timeline = useMemo(() => ({
    phases: [
      { name: 'foundation', start: 0, duration: 2000, hexagonOpacity: 0.3, castleOpacity: 0.2 },
      { name: 'towers', start: 2000, duration: 2000, hexagonOpacity: 0.6, castleOpacity: 0.5 },
      { name: 'keep', start: 4000, duration: 2000, hexagonOpacity: 1.0, castleOpacity: 0.8 },
      { name: 'breathing', start: 6000, duration: Infinity, hexagonOpacity: 1.0, castleOpacity: 1.0 }
    ] as AnimationPhase[]
  }), []);

  useEffect(() => {
    // Verificar preferência de movimento reduzido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isReducedMotion) {
      // Para usuários com preferência de movimento reduzido, mostrar castelo completo
      setCurrentPhase(3);
      setIsComplete(true);
      setHexagonOpacity(1.0);
      setCastleOpacity(1.0);
      return;
    }

    const startTime = Date.now();
    let animationId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      // Encontrar fase atual
      const currentPhaseIndex = timeline.phases.findIndex(
        phase => elapsed >= phase.start && elapsed < phase.start + phase.duration
      );

      if (currentPhaseIndex >= 0) {
        const phase = timeline.phases[currentPhaseIndex];
        const phaseProgress = Math.min((elapsed - phase.start) / phase.duration, 1);
        
        setCurrentPhase(currentPhaseIndex);
        
        // Opacidade dos hexágonos baseada na fase
        setHexagonOpacity(phase.hexagonOpacity * phaseProgress);
        
        // Opacidade do castelo
        if (currentPhaseIndex === 3) {
          // Fase de respiração
          setIsComplete(true);
          const breathingIntensity = 0.8 + Math.sin(elapsed * 0.001) * 0.2;
          setCastleOpacity(breathingIntensity);
        } else {
          setCastleOpacity(phase.castleOpacity * phaseProgress);
        }
      } else if (elapsed >= 6000) {
        // Após 6 segundos, entrar em modo de respiração
        setCurrentPhase(3);
        setIsComplete(true);
        setHexagonOpacity(1.0);
        const breathingIntensity = 0.8 + Math.sin(elapsed * 0.001) * 0.2;
        setCastleOpacity(breathingIntensity);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [timeline, isReducedMotion]);

  return {
    currentPhase,
    isComplete,
    hexagonOpacity,
    castleOpacity,
    timeline,
    isReducedMotion
  };
};
