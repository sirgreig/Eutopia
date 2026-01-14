import React from 'react';
import Svg, { Path, Rect, Circle, G, Polygon, Ellipse, Line } from 'react-native-svg';

interface IconProps {
  size: number;
  color?: string;
}

// House - cozy cottage style
export function HouseIcon({ size, color = '#e8a838' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Roof */}
      <Polygon points="50,8 95,45 5,45" fill="#8B4513" />
      <Polygon points="50,15 88,45 12,45" fill="#A0522D" />
      {/* Chimney */}
      <Rect x="70" y="18" width="12" height="22" fill="#654321" />
      <Rect x="68" y="14" width="16" height="6" fill="#8B4513" />
      {/* Walls */}
      <Rect x="15" y="45" width="70" height="47" fill={color} />
      <Rect x="15" y="45" width="70" height="47" fill="#D4A84B" />
      {/* Door */}
      <Rect x="40" y="58" width="20" height="34" fill="#654321" rx="2" />
      <Circle cx="55" cy="76" r="2" fill="#FFD700" />
      {/* Windows */}
      <Rect x="22" y="55" width="14" height="14" fill="#87CEEB" stroke="#654321" strokeWidth="2" />
      <Line x1="29" y1="55" x2="29" y2="69" stroke="#654321" strokeWidth="1" />
      <Line x1="22" y1="62" x2="36" y2="62" stroke="#654321" strokeWidth="1" />
      <Rect x="64" y="55" width="14" height="14" fill="#87CEEB" stroke="#654321" strokeWidth="2" />
      <Line x1="71" y1="55" x2="71" y2="69" stroke="#654321" strokeWidth="1" />
      <Line x1="64" y1="62" x2="78" y2="62" stroke="#654321" strokeWidth="1" />
    </Svg>
  );
}

// Farm - wheat/crops
export function FarmIcon({ size, color = '#7cb342' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Soil */}
      <Ellipse cx="50" cy="88" rx="42" ry="8" fill="#8B4513" />
      {/* Wheat stalks */}
      {[20, 35, 50, 65, 80].map((x, i) => (
        <G key={i}>
          {/* Stalk */}
          <Line x1={x} y1="85" x2={x} y2="25" stroke="#DAA520" strokeWidth="3" />
          {/* Wheat head */}
          <Ellipse cx={x} cy="22" rx="4" ry="8" fill="#F4D03F" />
          <Ellipse cx={x-5} cy="28" rx="3" ry="6" fill="#F4D03F" />
          <Ellipse cx={x+5} cy="28" rx="3" ry="6" fill="#F4D03F" />
          <Ellipse cx={x-4} cy="36" rx="3" ry="5" fill="#F4D03F" />
          <Ellipse cx={x+4} cy="36" rx="3" ry="5" fill="#F4D03F" />
          {/* Leaves */}
          <Path d={`M${x},55 Q${x-12},45 ${x-8},35`} stroke="#7cb342" strokeWidth="2" fill="none" />
          <Path d={`M${x},65 Q${x+12},55 ${x+8},45`} stroke="#7cb342" strokeWidth="2" fill="none" />
        </G>
      ))}
    </Svg>
  );
}

// Factory - industrial building
export function FactoryIcon({ size, color = '#708090' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Main building */}
      <Rect x="10" y="45" width="55" height="47" fill="#5a6a7a" />
      <Rect x="10" y="45" width="55" height="5" fill="#4a5a6a" />
      {/* Smokestacks */}
      <Rect x="70" y="25" width="12" height="67" fill={color} />
      <Rect x="82" y="35" width="10" height="57" fill="#606a7a" />
      <Ellipse cx="76" cy="25" rx="6" ry="3" fill="#8090a0" />
      <Ellipse cx="87" cy="35" rx="5" ry="2.5" fill="#8090a0" />
      {/* Smoke */}
      <Circle cx="76" cy="15" r="5" fill="#d0d0d0" opacity="0.7" />
      <Circle cx="80" cy="8" r="4" fill="#e0e0e0" opacity="0.5" />
      <Circle cx="87" cy="25" r="4" fill="#d0d0d0" opacity="0.7" />
      <Circle cx="90" cy="18" r="3" fill="#e0e0e0" opacity="0.5" />
      {/* Windows */}
      <Rect x="18" y="55" width="10" height="12" fill="#FFE4B5" />
      <Rect x="33" y="55" width="10" height="12" fill="#FFE4B5" />
      <Rect x="48" y="55" width="10" height="12" fill="#FFE4B5" />
      {/* Door */}
      <Rect x="28" y="72" width="18" height="20" fill="#4a5a6a" />
      <Rect x="28" y="72" width="18" height="3" fill="#3a4a5a" />
    </Svg>
  );
}

// Hospital - medical building with cross
export function HospitalIcon({ size, color = '#f5f5f5' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Main building */}
      <Rect x="15" y="30" width="70" height="62" fill={color} />
      <Rect x="15" y="30" width="70" height="8" fill="#e0e0e0" />
      {/* Red cross */}
      <Rect x="40" y="38" width="20" height="35" fill="#e53935" rx="2" />
      <Rect x="32" y="48" width="36" height="15" fill="#e53935" rx="2" />
      {/* Entrance */}
      <Rect x="35" y="75" width="30" height="17" fill="#4fc3f7" />
      <Line x1="50" y1="75" x2="50" y2="92" stroke="#29b6f6" strokeWidth="2" />
      {/* Windows */}
      <Rect x="20" y="42" width="10" height="10" fill="#81d4fa" />
      <Rect x="70" y="42" width="10" height="10" fill="#81d4fa" />
      <Rect x="20" y="58" width="10" height="10" fill="#81d4fa" />
      <Rect x="70" y="58" width="10" height="10" fill="#81d4fa" />
      {/* Roof detail */}
      <Rect x="40" y="22" width="20" height="10" fill="#e0e0e0" />
      <Rect x="45" y="18" width="10" height="6" fill="#d0d0d0" />
    </Svg>
  );
}

// School - educational building
export function SchoolIcon({ size, color = '#5c6bc0' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Main building */}
      <Rect x="10" y="40" width="80" height="52" fill="#7986cb" />
      {/* Center tower */}
      <Rect x="35" y="20" width="30" height="72" fill={color} />
      <Polygon points="50,8 70,22 30,22" fill="#3f51b5" />
      {/* Bell/clock */}
      <Circle cx="50" cy="32" r="8" fill="#fff9c4" />
      <Line x1="50" y1="32" x2="50" y2="27" stroke="#333" strokeWidth="1.5" />
      <Line x1="50" y1="32" x2="54" y2="34" stroke="#333" strokeWidth="1.5" />
      {/* Door */}
      <Rect x="42" y="70" width="16" height="22" fill="#3f51b5" rx="8" ry="8" />
      {/* Windows - left wing */}
      <Rect x="15" y="48" width="12" height="10" fill="#bbdefb" />
      <Rect x="15" y="65" width="12" height="10" fill="#bbdefb" />
      {/* Windows - right wing */}
      <Rect x="73" y="48" width="12" height="10" fill="#bbdefb" />
      <Rect x="73" y="65" width="12" height="10" fill="#bbdefb" />
      {/* Windows - tower */}
      <Rect x="40" y="45" width="8" height="8" fill="#bbdefb" />
      <Rect x="52" y="45" width="8" height="8" fill="#bbdefb" />
      {/* Flag */}
      <Line x1="50" y1="8" x2="50" y2="-2" stroke="#5d4037" strokeWidth="2" />
      <Polygon points="50,-2 65,3 50,8" fill="#e53935" />
    </Svg>
  );
}

// Fort - defensive structure
export function FortIcon({ size, color = '#8b6f4e' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Main walls */}
      <Rect x="15" y="40" width="70" height="52" fill={color} />
      {/* Towers */}
      <Rect x="5" y="25" width="25" height="67" fill="#9d8060" />
      <Rect x="70" y="25" width="25" height="67" fill="#9d8060" />
      {/* Battlements - left tower */}
      <Rect x="5" y="18" width="8" height="12" fill="#9d8060" />
      <Rect x="17" y="18" width="8" height="12" fill="#9d8060" />
      {/* Battlements - right tower */}
      <Rect x="70" y="18" width="8" height="12" fill="#9d8060" />
      <Rect x="82" y="18" width="8" height="12" fill="#9d8060" />
      {/* Battlements - center */}
      <Rect x="32" y="33" width="8" height="10" fill={color} />
      <Rect x="46" y="33" width="8" height="10" fill={color} />
      <Rect x="60" y="33" width="8" height="10" fill={color} />
      {/* Gate */}
      <Rect x="35" y="58" width="30" height="34" fill="#5d4037" rx="15" ry="15" />
      <Rect x="35" y="73" width="30" height="19" fill="#5d4037" />
      {/* Gate bars */}
      <Line x1="42" y1="60" x2="42" y2="92" stroke="#4a3728" strokeWidth="2" />
      <Line x1="50" y1="58" x2="50" y2="92" stroke="#4a3728" strokeWidth="2" />
      <Line x1="58" y1="60" x2="58" y2="92" stroke="#4a3728" strokeWidth="2" />
      <Line x1="35" y1="70" x2="65" y2="70" stroke="#4a3728" strokeWidth="2" />
      <Line x1="35" y1="80" x2="65" y2="80" stroke="#4a3728" strokeWidth="2" />
      {/* Arrow slits */}
      <Rect x="12" y="50" width="4" height="12" fill="#3a2a1a" />
      <Rect x="79" y="50" width="4" height="12" fill="#3a2a1a" />
    </Svg>
  );
}

// Fishing Boat
export function FishingBoatIcon({ size, color = '#ffd54f' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Water reflection */}
      <Ellipse cx="50" cy="88" rx="35" ry="6" fill="#1a5a8a" opacity="0.5" />
      {/* Hull */}
      <Path d="M15,70 Q10,85 25,85 L75,85 Q90,85 85,70 Z" fill="#8B4513" />
      <Path d="M18,70 Q15,82 27,82 L73,82 Q85,82 82,70 Z" fill="#A0522D" />
      {/* Deck */}
      <Rect x="20" y="62" width="60" height="10" fill="#DEB887" />
      {/* Cabin */}
      <Rect x="55" y="45" width="20" height="18" fill={color} />
      <Rect x="58" y="50" width="6" height="8" fill="#87CEEB" />
      <Rect x="66" y="50" width="6" height="8" fill="#87CEEB" />
      {/* Mast */}
      <Line x1="35" y1="62" x2="35" y2="20" stroke="#5d4037" strokeWidth="4" />
      {/* Boom */}
      <Line x1="35" y1="35" x2="55" y2="45" stroke="#5d4037" strokeWidth="2" />
      {/* Net/rigging */}
      <Path d="M35,25 Q25,40 20,62" stroke="#888" strokeWidth="1" fill="none" />
      <Path d="M35,25 Q45,40 50,62" stroke="#888" strokeWidth="1" fill="none" />
      <Line x1="22" y1="45" x2="48" y2="45" stroke="#888" strokeWidth="1" />
      {/* Flag */}
      <Polygon points="35,20 48,25 35,30" fill="#e53935" />
    </Svg>
  );
}

// PT Boat - patrol torpedo boat
export function PTBoatIcon({ size, color = '#90a4ae' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Water reflection */}
      <Ellipse cx="50" cy="88" rx="40" ry="6" fill="#1a5a8a" opacity="0.5" />
      {/* Hull - sleek military design */}
      <Path d="M5,72 L20,80 L80,80 L95,72 L85,68 L15,68 Z" fill="#607d8b" />
      <Path d="M8,72 L22,78 L78,78 L92,72 L83,69 L17,69 Z" fill={color} />
      {/* Deck */}
      <Rect x="18" y="58" width="64" height="12" fill="#78909c" />
      {/* Bridge/cabin */}
      <Rect x="40" y="42" width="25" height="17" fill="#546e7a" rx="2" />
      <Rect x="44" y="46" width="8" height="8" fill="#b0bec5" />
      <Rect x="54" y="46" width="8" height="8" fill="#b0bec5" />
      {/* Antenna/mast */}
      <Line x1="52" y1="42" x2="52" y2="25" stroke="#455a64" strokeWidth="2" />
      <Line x1="48" y1="30" x2="56" y2="30" stroke="#455a64" strokeWidth="1" />
      <Line x1="50" y1="28" x2="54" y2="28" stroke="#455a64" strokeWidth="1" />
      {/* Gun turret front */}
      <Circle cx="25" cy="60" r="6" fill="#455a64" />
      <Rect x="15" y="58" width="12" height="4" fill="#37474f" />
      {/* Gun turret rear */}
      <Circle cx="75" cy="60" r="5" fill="#455a64" />
      <Rect x="75" y="58" width="10" height="3" fill="#37474f" />
      {/* Torpedo tubes */}
      <Rect x="30" y="62" width="8" height="3" fill="#37474f" rx="1" />
      <Rect x="62" y="62" width="8" height="3" fill="#37474f" rx="1" />
      {/* Wake lines */}
      <Path d="M5,75 Q0,80 -5,82" stroke="#fff" strokeWidth="1" opacity="0.5" fill="none" />
      <Path d="M95,75 Q100,80 105,82" stroke="#fff" strokeWidth="1" opacity="0.5" fill="none" />
    </Svg>
  );
}

// Fallback construction icon
export function ConstructionIcon({ size, color = '#ff9800' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Crane base */}
      <Rect x="70" y="60" width="20" height="32" fill="#5d4037" />
      {/* Crane tower */}
      <Rect x="75" y="15" width="10" height="50" fill="#ffb74d" />
      {/* Crane arm */}
      <Rect x="20" y="15" width="65" height="6" fill="#ffb74d" />
      {/* Cable */}
      <Line x1="35" y1="21" x2="35" y2="55" stroke="#333" strokeWidth="2" />
      {/* Hook */}
      <Path d="M32,55 Q30,62 35,62 Q40,62 38,55" stroke="#333" strokeWidth="3" fill="none" />
      {/* Building under construction */}
      <Rect x="15" y="70" width="50" height="22" fill="#bdbdbd" />
      <Rect x="20" y="75" width="10" height="8" fill="#90a4ae" />
      <Rect x="35" y="75" width="10" height="8" fill="#90a4ae" />
      <Rect x="50" y="75" width="10" height="8" fill="#90a4ae" />
      {/* Scaffolding */}
      <Line x1="15" y1="70" x2="15" y2="55" stroke="#8d6e63" strokeWidth="2" />
      <Line x1="65" y1="70" x2="65" y2="55" stroke="#8d6e63" strokeWidth="2" />
      <Line x1="15" y1="60" x2="65" y2="60" stroke="#8d6e63" strokeWidth="2" />
    </Svg>
  );
}
