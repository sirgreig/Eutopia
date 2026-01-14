import React from 'react';
import Svg, { G, Rect, Polygon, Circle, Ellipse, Line } from 'react-native-svg';
import { BoatType } from '../../types/game';

interface BoatIconProps {
  type: BoatType;
  size?: number;
  selected?: boolean;
}

const COLORS = {
  // Fishing boat
  fishingHull: '#ffd54f',
  fishingHullDark: '#c9a030',
  fishingSail: '#ffffff',
  fishingMast: '#6b4423',
  fishingNet: '#8d6e63',
  
  // PT boat
  ptHull: '#90a4ae',
  ptHullDark: '#607080',
  ptCabin: '#546e7a',
  ptGun: '#455a64',
  ptAntenna: '#37474f',
  
  // Selection
  selected: '#4caf50',
  
  // Water reflection
  reflection: 'rgba(255,255,255,0.3)',
};

export function BoatIcon({ type, size = 40, selected = false }: BoatIconProps) {
  const s = size;
  
  const renderBoat = () => {
    if (type === 'fishing') {
      return (
        <G>
          {/* Selection ring */}
          {selected && (
            <Ellipse 
              cx={s/2} cy={s*0.6} 
              rx={s*0.48} ry={s*0.35} 
              fill="none" 
              stroke={COLORS.selected} 
              strokeWidth={3} 
            />
          )}
          
          {/* Water reflection/shadow */}
          <Ellipse cx={s/2} cy={s*0.85} rx={s*0.35} ry={s*0.08} fill="rgba(0,0,0,0.2)" />
          
          {/* Hull */}
          <Ellipse cx={s/2} cy={s*0.65} rx={s*0.4} ry={s*0.2} fill={COLORS.fishingHull} />
          <Ellipse cx={s/2 - s*0.08} cy={s*0.65} rx={s*0.3} ry={s*0.15} fill={COLORS.fishingHullDark} />
          
          {/* Deck */}
          <Ellipse cx={s/2} cy={s*0.55} rx={s*0.32} ry={s*0.12} fill={COLORS.fishingHull} />
          
          {/* Mast */}
          <Rect x={s*0.47} y={s*0.15} width={s*0.06} height={s*0.42} fill={COLORS.fishingMast} />
          
          {/* Sail */}
          <Polygon 
            points={`${s*0.53},${s*0.18} ${s*0.53},${s*0.52} ${s*0.82},${s*0.45}`}
            fill={COLORS.fishingSail}
            opacity={0.95}
          />
          <Line 
            x1={s*0.53} y1={s*0.18} 
            x2={s*0.82} y2={s*0.45} 
            stroke={COLORS.fishingMast} 
            strokeWidth={1} 
          />
          
          {/* Fishing net trailing */}
          <Line x1={s*0.25} y1={s*0.55} x2={s*0.12} y2={s*0.7} stroke={COLORS.fishingNet} strokeWidth={1.5} />
          <Line x1={s*0.2} y1={s*0.58} x2={s*0.08} y2={s*0.68} stroke={COLORS.fishingNet} strokeWidth={1} opacity={0.7} />
          <Line x1={s*0.15} y1={s*0.62} x2={s*0.05} y2={s*0.72} stroke={COLORS.fishingNet} strokeWidth={1} opacity={0.5} />
          
          {/* Small detail - rope coil */}
          <Circle cx={s*0.6} cy={s*0.55} r={s*0.04} fill={COLORS.fishingNet} />
        </G>
      );
    } else {
      // PT Boat
      return (
        <G>
          {/* Selection ring */}
          {selected && (
            <Ellipse 
              cx={s/2} cy={s*0.6} 
              rx={s*0.48} ry={s*0.35} 
              fill="none" 
              stroke={COLORS.selected} 
              strokeWidth={3} 
            />
          )}
          
          {/* Water reflection/shadow */}
          <Ellipse cx={s/2} cy={s*0.85} rx={s*0.38} ry={s*0.08} fill="rgba(0,0,0,0.2)" />
          
          {/* Hull - more angular/military */}
          <Polygon 
            points={`${s*0.1},${s*0.65} ${s*0.25},${s*0.75} ${s*0.75},${s*0.75} ${s*0.9},${s*0.65} ${s*0.85},${s*0.5} ${s*0.15},${s*0.5}`}
            fill={COLORS.ptHull}
          />
          <Polygon 
            points={`${s*0.1},${s*0.65} ${s*0.25},${s*0.75} ${s*0.4},${s*0.75} ${s*0.3},${s*0.5} ${s*0.15},${s*0.5}`}
            fill={COLORS.ptHullDark}
          />
          
          {/* Deck */}
          <Rect x={s*0.2} y={s*0.45} width={s*0.6} height={s*0.1} fill={COLORS.ptHull} rx={2} />
          
          {/* Cabin */}
          <Rect x={s*0.3} y={s*0.28} width={s*0.35} height={s*0.2} fill={COLORS.ptCabin} rx={3} />
          <Rect x={s*0.3} y={s*0.28} width={s*0.08} height={s*0.2} fill={COLORS.ptHullDark} rx={3} />
          
          {/* Windows */}
          <Rect x={s*0.4} y={s*0.32} width={s*0.08} height={s*0.06} fill={COLORS.reflection} rx={1} />
          <Rect x={s*0.52} y={s*0.32} width={s*0.08} height={s*0.06} fill={COLORS.reflection} rx={1} />
          
          {/* Gun turret */}
          <Circle cx={s*0.75} cy={s*0.38} r={s*0.08} fill={COLORS.ptGun} />
          <Rect x={s*0.73} y={s*0.18} width={s*0.06} height={s*0.15} fill={COLORS.ptGun} />
          <Circle cx={s*0.76} cy={s*0.18} r={s*0.025} fill={COLORS.ptHullDark} />
          
          {/* Antenna */}
          <Rect x={s*0.35} y={s*0.12} width={s*0.025} height={s*0.18} fill={COLORS.ptAntenna} />
          <Circle cx={s*0.36} cy={s*0.12} r={s*0.015} fill={COLORS.selected} />
          
          {/* Wake lines */}
          <Line x1={s*0.1} y1={s*0.72} x2={s*0.02} y2={s*0.78} stroke="white" strokeWidth={1.5} opacity={0.4} />
          <Line x1={s*0.15} y1={s*0.75} x2={s*0.05} y2={s*0.82} stroke="white" strokeWidth={1} opacity={0.3} />
        </G>
      );
    }
  };
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {renderBoat()}
    </Svg>
  );
}
