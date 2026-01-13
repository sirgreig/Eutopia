import React from 'react';
import Svg, { G, Rect, Polygon, Circle, Ellipse, Line, Path } from 'react-native-svg';
import { BuildingType } from '../../types/game';

interface BuildingIconProps {
  type: BuildingType;
  size?: number;
}

// Colors for buildings
const COLORS = {
  // House
  house: '#e8a838',
  houseRoof: '#c4872a',
  houseDoor: '#6b4423',
  houseWindow: '#87ceeb',
  
  // Factory
  factory: '#708090',
  factoryDark: '#556677',
  factoryChimney: '#4a5560',
  factorySmoke: '#c8d0d8',
  factoryWindow: '#f0c040',
  
  // Farm
  farm: '#7cb342',
  farmDark: '#5a9020',
  farmCrop: '#9ccc65',
  
  // Fort
  fort: '#8b6f4e',
  fortDark: '#6b5030',
  fortStone: '#a08060',
  
  // Hospital
  hospital: '#f5f5f5',
  hospitalCross: '#e53935',
  hospitalRoof: '#d0d0d0',
  
  // School
  school: '#5c6bc0',
  schoolDark: '#3f4fa0',
  schoolBell: '#ffd700',
  schoolWindow: '#87ceeb',
  
  // Dock
  dock: '#8d6e63',
  water: '#2d6a8e',
  
  // Lighthouse
  lighthouse: '#f5f5dc',
  lighthouseStripe: '#e53935',
  
  // Granary
  granary: '#d4a056',
  granaryDark: '#b8863c',
  
  // Marketplace
  marketplace: '#c2185b',
  marketplaceTent: '#e91e63',
  
  // Watchtower
  watchtower: '#795548',
  watchtowerDark: '#5d4037',
  
  // Apartment
  apartment: '#607d8b',
  apartmentDark: '#455a64',
  apartmentWindow: '#ffeb3b',
  
  gold: '#ffc107',
};

export function BuildingIcon({ type, size = 40 }: BuildingIconProps) {
  const s = size;
  
  const renderBuilding = () => {
    switch (type) {
      case 'house':
        return (
          <G>
            {/* Shadow */}
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.35} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            {/* Main body */}
            <Rect x={s*0.18} y={s*0.42} width={s*0.64} height={s*0.48} fill={COLORS.house} rx={2} />
            {/* Body shading */}
            <Rect x={s*0.18} y={s*0.42} width={s*0.15} height={s*0.48} fill={COLORS.houseRoof} rx={2} />
            {/* Roof */}
            <Polygon points={`${s/2},${s*0.12} ${s*0.1},${s*0.45} ${s*0.9},${s*0.45}`} fill={COLORS.houseRoof} />
            <Polygon points={`${s/2},${s*0.12} ${s*0.1},${s*0.45} ${s/2},${s*0.38}`} fill={COLORS.houseDoor} />
            {/* Chimney */}
            <Rect x={s*0.65} y={s*0.15} width={s*0.12} height={s*0.22} fill={COLORS.houseRoof} />
            <Rect x={s*0.63} y={s*0.13} width={s*0.16} height={s*0.05} fill={COLORS.houseDoor} />
            {/* Door */}
            <Rect x={s*0.4} y={s*0.6} width={s*0.2} height={s*0.3} fill={COLORS.houseDoor} rx={2} />
            <Circle cx={s*0.55} cy={s*0.75} r={s*0.025} fill={COLORS.gold} />
            {/* Windows */}
            <Rect x={s*0.24} y={s*0.5} width={s*0.12} height={s*0.14} fill={COLORS.houseWindow} rx={1} />
            <Rect x={s*0.64} y={s*0.5} width={s*0.12} height={s*0.14} fill={COLORS.houseWindow} rx={1} />
          </G>
        );
        
      case 'factory':
        return (
          <G>
            {/* Shadow */}
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.4} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            {/* Main building */}
            <Rect x={s*0.08} y={s*0.4} width={s*0.65} height={s*0.5} fill={COLORS.factory} rx={2} />
            <Rect x={s*0.08} y={s*0.4} width={s*0.12} height={s*0.5} fill={COLORS.factoryDark} rx={2} />
            {/* Tall chimney */}
            <Rect x={s*0.7} y={s*0.15} width={s*0.18} height={s*0.75} fill={COLORS.factoryChimney} rx={2} />
            <Rect x={s*0.68} y={s*0.12} width={s*0.22} height={s*0.06} fill={COLORS.factory} rx={1} />
            {/* Smoke puffs */}
            <Ellipse cx={s*0.79} cy={s*0.08} rx={s*0.08} ry={s*0.05} fill={COLORS.factorySmoke} opacity={0.8} />
            <Ellipse cx={s*0.88} cy={s*0.04} rx={s*0.06} ry={s*0.04} fill={COLORS.factorySmoke} opacity={0.6} />
            {/* Windows (lit) */}
            <Rect x={s*0.15} y={s*0.48} width={s*0.12} height={s*0.16} fill={COLORS.factoryWindow} rx={1} />
            <Rect x={s*0.32} y={s*0.48} width={s*0.12} height={s*0.16} fill={COLORS.factoryWindow} rx={1} />
            <Rect x={s*0.49} y={s*0.48} width={s*0.12} height={s*0.16} fill={COLORS.factoryWindow} rx={1} />
            {/* Door */}
            <Rect x={s*0.28} y={s*0.7} width={s*0.2} height={s*0.2} fill={COLORS.factoryDark} rx={2} />
            {/* Gear decoration */}
            <Circle cx={s*0.55} cy={s*0.78} r={s*0.06} fill={COLORS.factoryDark} />
            <Circle cx={s*0.55} cy={s*0.78} r={s*0.03} fill={COLORS.factory} />
          </G>
        );
        
      case 'farm':
        return (
          <G>
            {/* Field base */}
            <Rect x={s*0.05} y={s*0.05} width={s*0.9} height={s*0.9} fill={COLORS.farm} rx={4} />
            {/* Crop rows */}
            {[0.15, 0.35, 0.55, 0.75].map((y, i) => (
              <G key={i}>
                <Rect x={s*0.1} y={s*y} width={s*0.8} height={s*0.12} fill={COLORS.farmDark} rx={2} />
                {/* Individual crops */}
                {[0.15, 0.28, 0.41, 0.54, 0.67, 0.8].map((x, j) => (
                  <Ellipse key={j} cx={s*x} cy={s*(y+0.06)} rx={s*0.04} ry={s*0.05} fill={COLORS.farmCrop} />
                ))}
              </G>
            ))}
            {/* Small fence posts */}
            <Rect x={s*0.05} y={s*0.05} width={s*0.03} height={s*0.9} fill={COLORS.fortDark} />
            <Rect x={s*0.92} y={s*0.05} width={s*0.03} height={s*0.9} fill={COLORS.fortDark} />
          </G>
        );
        
      case 'fort':
        return (
          <G>
            {/* Shadow */}
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.4} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            {/* Main wall */}
            <Rect x={s*0.1} y={s*0.35} width={s*0.8} height={s*0.55} fill={COLORS.fort} rx={2} />
            <Rect x={s*0.1} y={s*0.35} width={s*0.15} height={s*0.55} fill={COLORS.fortDark} />
            {/* Battlements */}
            {[0.1, 0.28, 0.46, 0.64, 0.82].map((x, i) => (
              <Rect key={i} x={s*x} y={s*0.2} width={s*0.12} height={s*0.18} fill={i % 2 === 0 ? COLORS.fort : COLORS.fortStone} rx={1} />
            ))}
            {/* Stone texture lines */}
            <Line x1={s*0.1} y1={s*0.5} x2={s*0.9} y2={s*0.5} stroke={COLORS.fortDark} strokeWidth={1} opacity={0.5} />
            <Line x1={s*0.1} y1={s*0.65} x2={s*0.9} y2={s*0.65} stroke={COLORS.fortDark} strokeWidth={1} opacity={0.5} />
            {/* Gate */}
            <Rect x={s*0.35} y={s*0.5} width={s*0.3} height={s*0.4} fill={COLORS.fortDark} rx={2} />
            <Path d={`M ${s*0.35} ${s*0.5} Q ${s*0.5} ${s*0.4} ${s*0.65} ${s*0.5}`} fill={COLORS.fortDark} />
            {/* Gate bars */}
            <Line x1={s*0.42} y1={s*0.5} x2={s*0.42} y2={s*0.9} stroke={COLORS.fortStone} strokeWidth={2} />
            <Line x1={s*0.5} y1={s*0.45} x2={s*0.5} y2={s*0.9} stroke={COLORS.fortStone} strokeWidth={2} />
            <Line x1={s*0.58} y1={s*0.5} x2={s*0.58} y2={s*0.9} stroke={COLORS.fortStone} strokeWidth={2} />
            {/* Flag */}
            <Rect x={s*0.48} y={s*0.02} width={s*0.04} height={s*0.22} fill={COLORS.fortDark} />
            <Polygon points={`${s*0.52},${s*0.02} ${s*0.75},${s*0.08} ${s*0.52},${s*0.14}`} fill={COLORS.hospitalCross} />
          </G>
        );
        
      case 'hospital':
        return (
          <G>
            {/* Shadow */}
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.38} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            {/* Main building */}
            <Rect x={s*0.12} y={s*0.3} width={s*0.76} height={s*0.6} fill={COLORS.hospital} rx={3} />
            <Rect x={s*0.12} y={s*0.3} width={s*0.12} height={s*0.6} fill={COLORS.hospitalRoof} rx={3} />
            {/* Roof */}
            <Rect x={s*0.08} y={s*0.25} width={s*0.84} height={s*0.08} fill={COLORS.hospitalRoof} rx={2} />
            {/* Red cross */}
            <Rect x={s*0.42} y={s*0.38} width={s*0.16} height={s*0.4} fill={COLORS.hospitalCross} rx={2} />
            <Rect x={s*0.3} y={s*0.5} width={s*0.4} height={s*0.16} fill={COLORS.hospitalCross} rx={2} />
            {/* Door */}
            <Rect x={s*0.42} y={s*0.72} width={s*0.16} height={s*0.18} fill={COLORS.hospitalRoof} rx={2} />
            {/* Windows */}
            <Rect x={s*0.18} y={s*0.45} width={s*0.1} height={s*0.12} fill={COLORS.houseWindow} rx={1} />
            <Rect x={s*0.72} y={s*0.45} width={s*0.1} height={s*0.12} fill={COLORS.houseWindow} rx={1} />
          </G>
        );
        
      case 'school':
        return (
          <G>
            {/* Shadow */}
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.38} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            {/* Main building */}
            <Rect x={s*0.1} y={s*0.4} width={s*0.8} height={s*0.5} fill={COLORS.school} rx={3} />
            <Rect x={s*0.1} y={s*0.4} width={s*0.12} height={s*0.5} fill={COLORS.schoolDark} rx={3} />
            {/* Bell tower */}
            <Rect x={s*0.38} y={s*0.12} width={s*0.24} height={s*0.32} fill={COLORS.school} rx={2} />
            <Rect x={s*0.38} y={s*0.12} width={s*0.06} height={s*0.32} fill={COLORS.schoolDark} rx={2} />
            {/* Bell dome */}
            <Ellipse cx={s*0.5} cy={s*0.12} rx={s*0.14} ry={s*0.06} fill={COLORS.schoolDark} />
            {/* Bell */}
            <Circle cx={s*0.5} cy={s*0.22} r={s*0.06} fill={COLORS.schoolBell} />
            <Rect x={s*0.48} y={s*0.06} width={s*0.04} height={s*0.08} fill={COLORS.schoolBell} />
            {/* Clock */}
            <Circle cx={s*0.5} cy={s*0.32} r={s*0.05} fill="white" />
            <Line x1={s*0.5} y1={s*0.32} x2={s*0.5} y2={s*0.28} stroke={COLORS.schoolDark} strokeWidth={1} />
            <Line x1={s*0.5} y1={s*0.32} x2={s*0.53} y2={s*0.32} stroke={COLORS.schoolDark} strokeWidth={1} />
            {/* Door */}
            <Rect x={s*0.42} y={s*0.65} width={s*0.16} height={s*0.25} fill={COLORS.schoolDark} rx={2} />
            {/* Windows */}
            <Rect x={s*0.15} y={s*0.5} width={s*0.1} height={s*0.12} fill={COLORS.schoolWindow} rx={1} />
            <Rect x={s*0.28} y={s*0.5} width={s*0.1} height={s*0.12} fill={COLORS.schoolWindow} rx={1} />
            <Rect x={s*0.62} y={s*0.5} width={s*0.1} height={s*0.12} fill={COLORS.schoolWindow} rx={1} />
            <Rect x={s*0.75} y={s*0.5} width={s*0.1} height={s*0.12} fill={COLORS.schoolWindow} rx={1} />
          </G>
        );
        
      // Enhanced mode buildings
      case 'apartment':
        return (
          <G>
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.35} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            <Rect x={s*0.15} y={s*0.1} width={s*0.7} height={s*0.8} fill={COLORS.apartment} rx={2} />
            <Rect x={s*0.15} y={s*0.1} width={s*0.12} height={s*0.8} fill={COLORS.apartmentDark} rx={2} />
            {/* Windows grid */}
            {[0.18, 0.38, 0.58, 0.75].map((y, row) => (
              [0.25, 0.45, 0.65].map((x, col) => (
                <Rect key={`${row}-${col}`} x={s*x} y={s*y} width={s*0.12} height={s*0.12} fill={COLORS.apartmentWindow} rx={1} />
              ))
            ))}
            <Rect x={s*0.4} y={s*0.75} width={s*0.2} height={s*0.15} fill={COLORS.apartmentDark} rx={2} />
          </G>
        );
        
      case 'dock':
        return (
          <G>
            <Rect x={s*0.05} y={s*0.6} width={s*0.9} height={s*0.35} fill={COLORS.water} rx={2} />
            <Rect x={s*0.1} y={s*0.2} width={s*0.8} height={s*0.45} fill={COLORS.dock} rx={2} />
            {[0.28, 0.36, 0.44, 0.52, 0.6].map((y, i) => (
              <Line key={i} x1={s*0.1} y1={s*y} x2={s*0.9} y2={s*y} stroke={COLORS.fortDark} strokeWidth={1} />
            ))}
            <Rect x={s*0.15} y={s*0.55} width={s*0.08} height={s*0.35} fill={COLORS.fortDark} />
            <Rect x={s*0.77} y={s*0.55} width={s*0.08} height={s*0.35} fill={COLORS.fortDark} />
            <Ellipse cx={s*0.75} cy={s*0.35} rx={s*0.08} ry={s*0.06} fill={COLORS.house} />
            <Rect x={s*0.22} y={s*0.25} width={s*0.06} height={s*0.15} fill={COLORS.fortDark} />
          </G>
        );
        
      case 'lighthouse':
        return (
          <G>
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.25} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            <Polygon points={`${s*0.35},${s*0.9} ${s*0.4},${s*0.2} ${s*0.6},${s*0.2} ${s*0.65},${s*0.9}`} fill={COLORS.lighthouse} />
            <Rect x={s*0.38} y={s*0.35} width={s*0.24} height={s*0.08} fill={COLORS.lighthouseStripe} />
            <Rect x={s*0.4} y={s*0.55} width={s*0.2} height={s*0.08} fill={COLORS.lighthouseStripe} />
            <Rect x={s*0.35} y={s*0.1} width={s*0.3} height={s*0.12} fill={COLORS.factoryWindow} />
            <Polygon points={`${s*0.3},${s*0.1} ${s*0.5},${s*0.02} ${s*0.7},${s*0.1}`} fill={COLORS.hospitalCross} />
          </G>
        );
        
      case 'granary':
        return (
          <G>
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.35} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            <Rect x={s*0.2} y={s*0.35} width={s*0.6} height={s*0.55} fill={COLORS.granary} rx={3} />
            <Rect x={s*0.2} y={s*0.35} width={s*0.1} height={s*0.55} fill={COLORS.granaryDark} />
            <Ellipse cx={s*0.5} cy={s*0.35} rx={s*0.3} ry={s*0.15} fill={COLORS.granary} />
            <Ellipse cx={s*0.5} cy={s*0.35} rx={s*0.3} ry={s*0.08} fill={COLORS.granaryDark} />
            <Rect x={s*0.4} y={s*0.6} width={s*0.2} height={s*0.3} fill={COLORS.granaryDark} rx={2} />
          </G>
        );
        
      case 'marketplace':
        return (
          <G>
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.4} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            <Polygon points={`${s*0.1},${s*0.4} ${s*0.5},${s*0.1} ${s*0.9},${s*0.4}`} fill={COLORS.marketplaceTent} />
            <Polygon points={`${s*0.1},${s*0.4} ${s*0.5},${s*0.15} ${s*0.5},${s*0.4}`} fill={COLORS.marketplace} />
            <Rect x={s*0.1} y={s*0.4} width={s*0.8} height={s*0.5} fill={COLORS.marketplace} />
            <Rect x={s*0.15} y={s*0.5} width={s*0.2} height={s*0.15} fill={COLORS.gold} rx={2} />
            <Rect x={s*0.4} y={s*0.5} width={s*0.2} height={s*0.15} fill={COLORS.farm} rx={2} />
            <Rect x={s*0.65} y={s*0.5} width={s*0.2} height={s*0.15} fill={COLORS.house} rx={2} />
          </G>
        );
        
      case 'watchtower':
        return (
          <G>
            <Ellipse cx={s/2} cy={s*0.92} rx={s*0.25} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
            <Polygon points={`${s*0.3},${s*0.9} ${s*0.38},${s*0.35} ${s*0.62},${s*0.35} ${s*0.7},${s*0.9}`} fill={COLORS.watchtower} />
            <Rect x={s*0.32} y={s*0.2} width={s*0.36} height={s*0.18} fill={COLORS.watchtower} />
            {[0.28, 0.4, 0.52].map((x, i) => (
              <Rect key={i} x={s*x} y={s*0.12} width={s*0.08} height={s*0.1} fill={COLORS.watchtowerDark} />
            ))}
            <Rect x={s*0.42} y={s*0.5} width={s*0.16} height={s*0.2} fill={COLORS.watchtowerDark} rx={1} />
            <Circle cx={s*0.5} cy={s*0.28} r={s*0.04} fill={COLORS.factoryWindow} />
          </G>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {renderBuilding()}
    </Svg>
  );
}
