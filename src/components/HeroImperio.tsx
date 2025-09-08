"use client";

import { useState, useEffect, useMemo } from 'react';
import { useImperioAnimation } from './hooks/useImperioAnimation';
import { useHexagonGenerator } from './hooks/useHexagonGenerator';

interface Hexagon {
  id: string;
  x: number;
  y: number;
  size: number;
  phase: number;
  isCastle: boolean;
}

interface HeroImperioProps {
  className?: string;
}

export const HeroImperio = ({ className = "" }: HeroImperioProps) => {
  const { currentPhase, isComplete, hexagonOpacity, castleOpacity } = useImperioAnimation();
  const { hexagons, castleHexagons } = useHexagonGenerator();
  
  // Paths do castelo para desktop e mobile
  const castlePaths = useMemo(() => ({
    desktop: "M 100 500 L 100 380 L 160 380 L 160 340 L 190 340 L 190 300 L 230 300 L 230 340 L 260 340 L 260 380 L 320 380 L 320 280 L 360 280 L 360 380 L 420 380 L 420 340 L 450 340 L 450 300 L 490 300 L 490 340 L 520 340 L 520 380 L 580 380 L 580 500 Z",
    mobile: "M 40 320 L 40 260 L 80 260 L 80 230 L 100 230 L 100 210 L 130 210 L 130 230 L 150 230 L 150 260 L 190 260 L 190 210 L 210 210 L 210 260 L 250 260 L 250 230 L 270 230 L 270 210 L 300 210 L 300 230 L 320 230 L 320 260 L 360 260 L 360 320 Z"
  }), []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`hero-imperio-background ${className}`}>
      <svg
        className="hexagon-grid"
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ 
          opacity: hexagonOpacity,
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: -1
        }}
      >
        <defs>
          {/* ClipPath para o castelo */}
          <clipPath id="castle-clip">
            <path
              d={isMobile ? castlePaths.mobile : castlePaths.desktop}
              fill="none"
              stroke="none"
            />
          </clipPath>
          
          {/* Gradiente para hexágonos do castelo */}
          <linearGradient id="castle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Hexágonos de fundo */}
        {hexagons.map((hex) => (
          <g key={hex.id}>
            <polygon
              points={generateHexagonPoints(hex.x, hex.y, hex.size)}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeOpacity="0.2"
              className="hexagon-background"
            />
          </g>
        ))}

        {/* Hexágonos do castelo (com clipPath) */}
        <g clipPath="url(#castle-clip)">
          {castleHexagons.map((hex, index) => (
            <g key={`castle-${hex.id}`}>
              <polygon
                points={generateHexagonPoints(hex.x, hex.y, hex.size)}
                fill="none"
                stroke="url(#castle-gradient)"
                strokeWidth="2"
                strokeOpacity="1"
                className={`hexagon-castle phase-${currentPhase}`}
                style={{
                  animationDelay: `${index * 0.01}s`,
                  opacity: castleOpacity
                }}
              />
            </g>
          ))}
        </g>

        {/* Silhueta do castelo */}
        <path
          d={isMobile ? castlePaths.mobile : castlePaths.desktop}
          fill="none"
          stroke="#ffffff"
          strokeWidth={isMobile ? "2" : "3"}
          strokeOpacity={castleOpacity}
          className={`castle-silhouette ${isComplete ? 'breathing' : ''}`}
        />
      </svg>

      {/* Partículas flutuantes (após formação completa) */}
      {isComplete && (
        <div className="particle-system">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Função para gerar pontos do hexágono
function generateHexagonPoints(x: number, y: number, size: number): string {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(' ');
}

export default HeroImperio;
