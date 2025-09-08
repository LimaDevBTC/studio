import { useState, useEffect, useMemo } from 'react';

interface Hexagon {
  id: string;
  x: number;
  y: number;
  size: number;
  phase: number;
  isCastle: boolean;
}

interface CastleBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useHexagonGenerator = () => {
  const [hexagons, setHexagons] = useState<Hexagon[]>([]);
  const [castleHexagons, setCastleHexagons] = useState<Hexagon[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Paths do castelo para determinar quais hexágonos estão dentro
  const castlePaths = useMemo(() => ({
    desktop: "M 100 500 L 100 380 L 160 380 L 160 340 L 190 340 L 190 300 L 230 300 L 230 340 L 260 340 L 260 380 L 320 380 L 320 280 L 360 280 L 360 380 L 420 380 L 420 340 L 450 340 L 450 300 L 490 300 L 490 340 L 520 340 L 520 380 L 580 380 L 580 500 Z",
    mobile: "M 40 320 L 40 260 L 80 260 L 80 230 L 100 230 L 100 210 L 130 210 L 130 230 L 150 230 L 150 260 L 190 260 L 190 210 L 210 210 L 210 260 L 250 260 L 250 230 L 270 230 L 270 210 L 300 210 L 300 230 L 320 230 L 320 260 L 360 260 L 360 320 Z"
  }), []);

  // Função para verificar se um ponto está dentro do path do castelo
  const isPointInCastle = (x: number, y: number, path: string): boolean => {
    // Simplificação: verificar se está dentro de um retângulo aproximado do castelo
    if (isMobile) {
      return x >= 40 && x <= 360 && y >= 210 && y <= 320;
    } else {
      return x >= 100 && x <= 580 && y >= 280 && y <= 500;
    }
  };

  // Função para gerar grid de hexágonos
  const generateHexagonGrid = (width: number, height: number, isMobile: boolean) => {
    const hexSize = isMobile ? 15 : 20;
    const spacing = isMobile ? 20 : 25;
    const hexHeight = spacing * 0.866; // Altura do hexágono
    
    const cols = Math.ceil(width / spacing) + 2;
    const rows = Math.ceil(height / hexHeight) + 2;
    
    const newHexagons: Hexagon[] = [];
    const newCastleHexagons: Hexagon[] = [];
    
    const currentPath = isMobile ? castlePaths.mobile : castlePaths.desktop;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing + (row % 2) * spacing / 2;
        const y = row * hexHeight;
        
        // Variação de tamanho para criar densidade visual
        const size = hexSize + Math.random() * 8;
        const phase = Math.random() * Math.PI * 2;
        
        const hexagon: Hexagon = {
          id: `${row}-${col}`,
          x,
          y,
          size,
          phase,
          isCastle: false
        };
        
        // Verificar se está dentro do castelo
        if (isPointInCastle(x, y, currentPath)) {
          hexagon.isCastle = true;
          newCastleHexagons.push(hexagon);
        } else {
          newHexagons.push(hexagon);
        }
      }
    }
    
    return { hexagons: newHexagons, castleHexagons: newCastleHexagons };
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const generateGrid = () => {
      const { hexagons: newHexagons, castleHexagons: newCastleHexagons } = 
        generateHexagonGrid(window.innerWidth, window.innerHeight, isMobile);
      
      setHexagons(newHexagons);
      setCastleHexagons(newCastleHexagons);
    };
    
    generateGrid();
    
    const handleResize = debounce(generateGrid, 100);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, castlePaths]);

  return { hexagons, castleHexagons, isMobile };
};

// Função debounce para otimizar performance
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
