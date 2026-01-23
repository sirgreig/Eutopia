// src/components/game/AnimatedIcons.tsx
// Building icons - static SVGs (SMIL animations not supported in React Native SVG)
// For animations, we'd need to use react-native-reanimated with SVG transforms

import React from 'react';
import Svg, { 
  G, Rect, Circle, Ellipse, Path, Line, Polygon,
} from 'react-native-svg';

interface IconProps {
  size: number;
  animated?: boolean; // Reserved for future react-native-reanimated implementation
}

// Color palette
const COLORS = {
  // House
  houseWall: '#e8d4b8',
  houseRoof: '#8B4513',
  houseDoor: '#5D4037',
  houseWindow: '#87CEEB',
  houseChimney: '#8B4513',
  smoke: '#d0d0d0',
  
  // Factory
  factory: '#708090',
  factoryDark: '#4a5a6a',
  factoryChimney: '#5a6a7a',
  factoryWindow: '#FFE4B5',
  factorySmoke: '#c0c0c0',
  
  // Farm
  farmSoil: '#8B4513',
  farmCrop: '#7cb342',
  farmCropDark: '#558b2f',
  
  // Hospital
  hospitalWall: '#f5f5f5',
  hospitalCross: '#e53935',
  hospitalWindow: '#4fc3f7',
  
  // School
  schoolWall: '#ffcc80',
  schoolRoof: '#8B4513',
  schoolBell: '#ffd700',
  schoolWindow: '#87CEEB',
  
  // Fort
  fortStone: '#808080',
  fortStoneDark: '#606060',
  fortFlag: '#e53935',
  fortFlagPole: '#5D4037',
};

// ============================================
// HOUSE - with static smoke
// ============================================
export function AnimatedHouseIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Shadow */}
      <Ellipse cx="50" cy="92" rx="35" ry="6" fill="rgba(0,0,0,0.2)" />
      
      {/* Main house body */}
      <Rect x="20" y="45" width="60" height="47" fill={COLORS.houseWall} rx="2" />
      
      {/* Roof */}
      <Polygon points="10,48 50,15 90,48" fill={COLORS.houseRoof} />
      <Polygon points="15,48 50,20 85,48" fill="#9B5523" />
      
      {/* Chimney */}
      <Rect x="65" y="20" width="12" height="25" fill={COLORS.houseChimney} />
      <Rect x="63" y="18" width="16" height="5" fill="#9B5523" />
      
      {/* Static smoke puffs */}
      <Circle cx="71" cy="8" r="5" fill={COLORS.smoke} opacity="0.6" />
      <Circle cx="74" cy="2" r="4" fill={COLORS.smoke} opacity="0.4" />
      <Circle cx="68" cy="4" r="3" fill={COLORS.smoke} opacity="0.3" />
      
      {/* Door */}
      <Rect x="40" y="62" width="20" height="30" fill={COLORS.houseDoor} rx="2" />
      <Circle cx="55" cy="78" r="2" fill="#ffd700" />
      
      {/* Windows */}
      <Rect x="25" y="55" width="12" height="14" fill={COLORS.houseWindow} rx="1" />
      <Rect x="63" y="55" width="12" height="14" fill={COLORS.houseWindow} rx="1" />
      <Line x1="31" y1="55" x2="31" y2="69" stroke="#fff" strokeWidth="1" />
      <Line x1="25" y1="62" x2="37" y2="62" stroke="#fff" strokeWidth="1" />
      <Line x1="69" y1="55" x2="69" y2="69" stroke="#fff" strokeWidth="1" />
      <Line x1="63" y1="62" x2="75" y2="62" stroke="#fff" strokeWidth="1" />
    </Svg>
  );
}

// ============================================
// FACTORY - with static smoke
// ============================================
export function AnimatedFactoryIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Shadow */}
      <Ellipse cx="50" cy="92" rx="40" ry="6" fill="rgba(0,0,0,0.2)" />
      
      {/* Main building */}
      <Rect x="8" y="40" width="60" height="52" fill={COLORS.factory} rx="2" />
      <Rect x="8" y="40" width="60" height="6" fill={COLORS.factoryDark} />
      
      {/* Smokestacks */}
      <Rect x="70" y="20" width="14" height="72" fill={COLORS.factoryChimney} rx="2" />
      <Rect x="70" y="17" width="14" height="6" fill={COLORS.factory} rx="1" />
      <Rect x="86" y="35" width="10" height="57" fill={COLORS.factoryDark} rx="2" />
      <Rect x="86" y="32" width="10" height="5" fill={COLORS.factory} rx="1" />
      
      {/* Static smoke puffs */}
      <Circle cx="77" cy="5" r="8" fill={COLORS.factorySmoke} opacity="0.7" />
      <Circle cx="82" cy="-2" r="6" fill={COLORS.factorySmoke} opacity="0.5" />
      <Circle cx="72" cy="0" r="5" fill={COLORS.factorySmoke} opacity="0.4" />
      <Circle cx="91" cy="20" r="5" fill={COLORS.factorySmoke} opacity="0.6" />
      <Circle cx="94" cy="14" r="4" fill={COLORS.factorySmoke} opacity="0.4" />
      
      {/* Windows */}
      <Rect x="15" y="50" width="12" height="16" fill={COLORS.factoryWindow} rx="1" />
      <Rect x="32" y="50" width="12" height="16" fill={COLORS.factoryWindow} rx="1" />
      <Rect x="49" y="50" width="12" height="16" fill={COLORS.factoryWindow} rx="1" />
      
      {/* Door */}
      <Rect x="28" y="72" width="20" height="20" fill={COLORS.factoryDark} rx="2" />
      
      {/* Gear (static) */}
      <Circle cx="55" cy="80" r="7" fill={COLORS.factoryDark} />
      <Circle cx="55" cy="80" r="3" fill={COLORS.factory} />
    </Svg>
  );
}

// ============================================
// FARM - with static crops
// ============================================
export function AnimatedFarmIcon({ size }: IconProps) {
  const cropPositions = [15, 30, 45, 60, 75, 85];
  
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Soil rows */}
      <Rect x="5" y="75" width="90" height="20" fill={COLORS.farmSoil} rx="3" />
      <Rect x="5" y="50" width="90" height="20" fill={COLORS.farmSoil} rx="3" />
      <Rect x="5" y="25" width="90" height="20" fill={COLORS.farmSoil} rx="3" />
      
      {/* Crop stalks */}
      {cropPositions.map((x, i) => (
        <G key={`crop-${i}`}>
          {/* Back row */}
          <Path d={`M${x},35 Q${x-2},25 ${x},15`} stroke={COLORS.farmCrop} strokeWidth="3" fill="none" />
          {/* Middle row */}
          <Path d={`M${x},60 Q${x-2},50 ${x},40`} stroke={COLORS.farmCrop} strokeWidth="3" fill="none" />
          {/* Front row */}
          <Path d={`M${x},85 Q${x-2},75 ${x},65`} stroke={COLORS.farmCropDark} strokeWidth="3" fill="none" />
          
          {/* Grain heads */}
          <Ellipse cx={x} cy="13" rx="4" ry="3" fill="#daa520" />
          <Ellipse cx={x} cy="38" rx="4" ry="3" fill="#daa520" />
          <Ellipse cx={x} cy="63" rx="4" ry="3" fill="#b8860b" />
        </G>
      ))}
    </Svg>
  );
}

// ============================================
// HOSPITAL - with static cross
// ============================================
export function AnimatedHospitalIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Shadow */}
      <Ellipse cx="50" cy="92" rx="38" ry="6" fill="rgba(0,0,0,0.2)" />
      
      {/* Main building */}
      <Rect x="12" y="28" width="76" height="64" fill={COLORS.hospitalWall} rx="3" />
      <Rect x="12" y="28" width="76" height="8" fill="#e0e0e0" />
      
      {/* Red cross */}
      <Rect x="40" y="36" width="20" height="40" fill={COLORS.hospitalCross} rx="2" />
      <Rect x="30" y="48" width="40" height="16" fill={COLORS.hospitalCross} rx="2" />
      
      {/* Entrance */}
      <Rect x="35" y="76" width="30" height="16" fill={COLORS.hospitalWindow} rx="2" />
      <Line x1="50" y1="76" x2="50" y2="92" stroke="#fff" strokeWidth="2" />
      
      {/* Windows */}
      <Rect x="18" y="45" width="10" height="12" fill={COLORS.hospitalWindow} rx="1" />
      <Rect x="72" y="45" width="10" height="12" fill={COLORS.hospitalWindow} rx="1" />
      <Rect x="18" y="62" width="10" height="12" fill={COLORS.hospitalWindow} rx="1" />
      <Rect x="72" y="62" width="10" height="12" fill={COLORS.hospitalWindow} rx="1" />
    </Svg>
  );
}

// ============================================
// SCHOOL - with static bell
// ============================================
export function AnimatedSchoolIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Shadow */}
      <Ellipse cx="50" cy="92" rx="40" ry="6" fill="rgba(0,0,0,0.2)" />
      
      {/* Main building */}
      <Rect x="10" y="45" width="80" height="47" fill={COLORS.schoolWall} rx="2" />
      
      {/* Bell tower */}
      <Rect x="35" y="20" width="30" height="28" fill={COLORS.schoolWall} />
      <Polygon points="35,22 50,8 65,22" fill={COLORS.schoolRoof} />
      
      {/* Bell */}
      <Ellipse cx="50" cy="32" rx="8" ry="6" fill={COLORS.schoolBell} />
      <Rect x="48" y="35" width="4" height="5" fill="#b8860b" />
      
      {/* Roof */}
      <Polygon points="5,48 50,25 95,48" fill={COLORS.schoolRoof} />
      
      {/* Clock */}
      <Circle cx="50" cy="55" r="8" fill="#fff" stroke="#333" strokeWidth="1" />
      <Line x1="50" y1="55" x2="50" y2="49" stroke="#333" strokeWidth="1.5" />
      <Line x1="50" y1="55" x2="54" y2="55" stroke="#333" strokeWidth="1" />
      
      {/* Door */}
      <Rect x="40" y="72" width="20" height="20" fill={COLORS.houseDoor} rx="2" />
      
      {/* Windows */}
      <Rect x="15" y="55" width="12" height="14" fill={COLORS.schoolWindow} rx="1" />
      <Rect x="73" y="55" width="12" height="14" fill={COLORS.schoolWindow} rx="1" />
      <Rect x="15" y="72" width="12" height="14" fill={COLORS.schoolWindow} rx="1" />
      <Rect x="73" y="72" width="12" height="14" fill={COLORS.schoolWindow} rx="1" />
    </Svg>
  );
}

// ============================================
// FORT - with static flag
// ============================================
export function AnimatedFortIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Shadow */}
      <Ellipse cx="50" cy="92" rx="42" ry="6" fill="rgba(0,0,0,0.2)" />
      
      {/* Main fort body */}
      <Rect x="10" y="40" width="80" height="52" fill={COLORS.fortStone} rx="2" />
      
      {/* Crenellations (battlements) */}
      {[15, 30, 45, 60, 75].map((x, i) => (
        <Rect key={`cren-${i}`} x={x} y="30" width="10" height="15" fill={COLORS.fortStone} />
      ))}
      
      {/* Flag pole */}
      <Rect x="48" y="5" width="4" height="30" fill={COLORS.fortFlagPole} />
      
      {/* Flag (static wave shape) */}
      <Path d="M52,8 Q65,12 52,18 Q65,22 52,26 L52,8" fill={COLORS.fortFlag} />
      
      {/* Gate */}
      <Path d="M35,92 L35,60 Q50,50 65,60 L65,92 Z" fill={COLORS.fortStoneDark} />
      
      {/* Portcullis bars */}
      {[40, 50, 60].map((x, i) => (
        <Line key={`v-${i}`} x1={x} y1="60" x2={x} y2="92" stroke="#333" strokeWidth="2" />
      ))}
      {[70, 80].map((y, i) => (
        <Line key={`h-${i}`} x1="35" y1={y} x2="65" y2={y} stroke="#333" strokeWidth="2" />
      ))}
      
      {/* Stone texture */}
      <Line x1="10" y1="55" x2="35" y2="55" stroke={COLORS.fortStoneDark} strokeWidth="1" />
      <Line x1="65" y1="55" x2="90" y2="55" stroke={COLORS.fortStoneDark} strokeWidth="1" />
      <Line x1="10" y1="70" x2="35" y2="70" stroke={COLORS.fortStoneDark} strokeWidth="1" />
      <Line x1="65" y1="70" x2="90" y2="70" stroke={COLORS.fortStoneDark} strokeWidth="1" />
    </Svg>
  );
}

// Export all icons
export const AnimatedIcons = {
  house: AnimatedHouseIcon,
  factory: AnimatedFactoryIcon,
  farm: AnimatedFarmIcon,
  hospital: AnimatedHospitalIcon,
  school: AnimatedSchoolIcon,
  fort: AnimatedFortIcon,
};

export default AnimatedIcons;
