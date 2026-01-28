// src/components/game/Icons.tsx
// Modern SVG building icons with gradients, shadows, and architectural details
// Designed for animation compatibility with react-native-reanimated

import React from 'react';
import Svg, { 
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G, 
  Rect, 
  Circle, 
  Ellipse, 
  Path, 
  Line, 
  Polygon,
} from 'react-native-svg';

interface IconProps {
  size?: number;
}

// ============================================
// HOUSE - Cozy cottage with chimney
// ============================================
export const HouseIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="houseRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#A0522D" />
        <Stop offset="100%" stopColor="#6B3510" />
      </LinearGradient>
      <LinearGradient id="houseWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#F5DEB3" />
        <Stop offset="100%" stopColor="#D2B48C" />
      </LinearGradient>
      <LinearGradient id="windowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#B0E0E6" />
        <Stop offset="50%" stopColor="#87CEEB" />
        <Stop offset="100%" stopColor="#6CA6CD" />
      </LinearGradient>
      <LinearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#8B4513" />
        <Stop offset="50%" stopColor="#A0522D" />
        <Stop offset="100%" stopColor="#6B3510" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="14" ry="2" fill="rgba(0,0,0,0.2)" />
    
    {/* Main wall */}
    <Rect x="8" y="17" width="24" height="18" fill="url(#houseWallGrad)" />
    <Rect x="8" y="17" width="2" height="18" fill="rgba(255,255,255,0.3)" />
    
    {/* Roof */}
    <Polygon points="20,3 37,18 3,18" fill="url(#houseRoofGrad)" />
    <Polygon points="20,3 20,6 6,17 3,18" fill="rgba(255,255,255,0.2)" />
    <Polygon points="3,18 37,18 35,20 5,20" fill="#5D2906" />
    
    {/* Chimney */}
    <Rect x="26" y="6" width="5" height="10" fill="#8B7355" />
    <Rect x="25" y="5" width="7" height="2" fill="#6B5344" />
    
    {/* Smoke puffs */}
    <Circle cx="28.5" cy="2" r="2" fill="rgba(200,200,200,0.5)" />
    <Circle cx="30" cy="0" r="1.5" fill="rgba(200,200,200,0.3)" />
    
    {/* Windows */}
    <Rect x="11" y="21" width="7" height="6" fill="#4A3728" rx="0.5" />
    <Rect x="12" y="22" width="5" height="4" fill="url(#windowGrad)" />
    <Rect x="14.25" y="22" width="0.5" height="4" fill="#4A3728" />
    <Rect x="12" y="23.75" width="5" height="0.5" fill="#4A3728" />
    <Rect x="12" y="22" width="1.5" height="1" fill="rgba(255,255,255,0.5)" />
    
    <Rect x="22" y="21" width="7" height="6" fill="#4A3728" rx="0.5" />
    <Rect x="23" y="22" width="5" height="4" fill="url(#windowGrad)" />
    <Rect x="25.25" y="22" width="0.5" height="4" fill="#4A3728" />
    <Rect x="23" y="23.75" width="5" height="0.5" fill="#4A3728" />
    <Rect x="23" y="22" width="1.5" height="1" fill="rgba(255,255,255,0.5)" />
    
    {/* Door */}
    <Rect x="16" y="24" width="8" height="11" fill="#3D2914" rx="0.5" />
    <Rect x="17" y="25" width="6" height="10" fill="url(#doorGrad)" rx="0.5" />
    <Rect x="17.5" y="26" width="2.2" height="3.5" fill="rgba(0,0,0,0.15)" rx="0.3" />
    <Rect x="20.3" y="26" width="2.2" height="3.5" fill="rgba(0,0,0,0.15)" rx="0.3" />
    <Circle cx="22" cy="30" r="0.7" fill="#FFD700" />
    
    {/* Foundation */}
    <Rect x="8" y="35" width="24" height="1" fill="#8B7355" />
  </Svg>
);

// ============================================
// FARM - Crops with barn and silo
// ============================================
export const FarmIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="barnWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#CD5C5C" />
        <Stop offset="50%" stopColor="#B22222" />
        <Stop offset="100%" stopColor="#8B0000" />
      </LinearGradient>
      <LinearGradient id="barnRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#696969" />
        <Stop offset="100%" stopColor="#2F2F2F" />
      </LinearGradient>
      <LinearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#8B6914" />
        <Stop offset="100%" stopColor="#5D4E37" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="38" rx="16" ry="2" fill="rgba(0,0,0,0.15)" />
    
    {/* Tilled soil base */}
    <Path d="M2,26 L38,26 L36,38 L4,38 Z" fill="url(#soilGrad)" />
    
    {/* Crop rows */}
    <Rect x="4" y="27" width="20" height="2.5" fill="#3A5A3A" />
    <Rect x="4" y="30.5" width="20" height="2.5" fill="#2A4A2A" />
    <Rect x="4" y="34" width="20" height="2.5" fill="#3A5A3A" />
    
    {/* Crops */}
    {[6, 10, 14, 18, 22].map((x, i) => (
      <G key={`crop-${i}`}>
        <Ellipse cx={x} cy="27" rx="1.5" ry="1" fill="#228B22" />
        <Ellipse cx={x} cy="30.5" rx="1.5" ry="1" fill="#32CD32" />
        <Ellipse cx={x} cy="34" rx="1.5" ry="1" fill="#228B22" />
        <Path d={`M${x},27 L${x},24`} stroke="#228B22" strokeWidth="0.5" />
        <Path d={`M${x},30.5 L${x},27.5`} stroke="#32CD32" strokeWidth="0.5" />
        <Path d={`M${x},34 L${x},31`} stroke="#228B22" strokeWidth="0.5" />
      </G>
    ))}
    
    {/* Barn */}
    <Rect x="26" y="14" width="12" height="14" fill="url(#barnWallGrad)" />
    <Rect x="26" y="14" width="1.5" height="14" fill="rgba(255,255,255,0.2)" />
    <Polygon points="25,14 32,6 39,14" fill="url(#barnRoofGrad)" />
    <Polygon points="25,14 32,6 32,8 27,14" fill="rgba(255,255,255,0.15)" />
    
    {/* Barn door */}
    <Rect x="29" y="19" width="6" height="9" fill="#4A1A1A" />
    <Rect x="29" y="19" width="3" height="9" fill="#5A2A2A" />
    <Line x1="29" y1="19" x2="35" y2="28" stroke="#3A0A0A" strokeWidth="0.4" />
    <Line x1="35" y1="19" x2="29" y2="28" stroke="#3A0A0A" strokeWidth="0.4" />
    
    {/* Barn window */}
    <Rect x="30" y="10" width="4" height="3" fill="#1A1A2A" />
    
    {/* Silo */}
    <Rect x="38" y="10" width="4" height="18" fill="#C0C0C0" rx="2" />
    <Ellipse cx="40" cy="10" rx="2" ry="1" fill="#A0A0A0" />
    <Rect x="38" y="10" width="1" height="18" fill="rgba(255,255,255,0.2)" />
  </Svg>
);

// ============================================
// FACTORY - Industrial with smokestacks
// ============================================
export const FactoryIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="factoryWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#808080" />
        <Stop offset="30%" stopColor="#696969" />
        <Stop offset="100%" stopColor="#4A4A4A" />
      </LinearGradient>
      <LinearGradient id="stackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#A0522D" />
        <Stop offset="50%" stopColor="#8B4513" />
        <Stop offset="100%" stopColor="#6B3510" />
      </LinearGradient>
      <RadialGradient id="smokeGrad" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(200,200,200,0.6)" />
        <Stop offset="100%" stopColor="rgba(150,150,150,0)" />
      </RadialGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="15" ry="2" fill="rgba(0,0,0,0.2)" />
    
    {/* Main building */}
    <Rect x="5" y="18" width="30" height="18" fill="url(#factoryWallGrad)" />
    <Rect x="5" y="18" width="2" height="18" fill="rgba(255,255,255,0.15)" />
    
    {/* Sawtooth roof */}
    <Polygon points="5,18 12,10 12,18" fill="#505050" />
    <Polygon points="12,18 19,10 19,18" fill="#606060" />
    <Polygon points="19,18 26,10 26,18" fill="#505050" />
    <Polygon points="26,18 33,10 33,18 35,18" fill="#606060" />
    {/* Roof glass */}
    <Polygon points="6,17 11,11 11,17" fill="rgba(135,206,235,0.5)" />
    <Polygon points="13,17 18,11 18,17" fill="rgba(135,206,235,0.5)" />
    <Polygon points="20,17 25,11 25,17" fill="rgba(135,206,235,0.5)" />
    <Polygon points="27,17 32,11 32,17" fill="rgba(135,206,235,0.5)" />
    
    {/* Smokestacks */}
    <Rect x="8" y="2" width="4" height="16" fill="url(#stackGrad)" />
    <Rect x="8" y="2" width="1" height="16" fill="rgba(255,255,255,0.2)" />
    <Ellipse cx="10" cy="2" rx="2.5" ry="1" fill="#6B3510" />
    
    <Rect x="28" y="4" width="4" height="14" fill="url(#stackGrad)" />
    <Rect x="28" y="4" width="1" height="14" fill="rgba(255,255,255,0.2)" />
    <Ellipse cx="30" cy="4" rx="2.5" ry="1" fill="#6B3510" />
    
    {/* Smoke */}
    <Circle cx="10" cy="-1" r="3" fill="url(#smokeGrad)" />
    <Circle cx="12" cy="-3" r="2.5" fill="url(#smokeGrad)" />
    <Circle cx="30" cy="1" r="2.5" fill="url(#smokeGrad)" />
    <Circle cx="32" cy="-1" r="2" fill="url(#smokeGrad)" />
    
    {/* Windows */}
    {[8, 13.5, 19, 24.5].map((x, i) => (
      <G key={`win-${i}`}>
        <Rect x={x} y="22" width="4" height="5" fill="#1A1A2A" />
        <Rect x={x} y="22" width="1.5" height="2" fill="rgba(255,255,0,0.3)" />
      </G>
    ))}
    
    {/* Loading dock */}
    <Rect x="14" y="28" width="12" height="8" fill="#2A2A2A" />
    <Rect x="15" y="29" width="10" height="6" fill="#3A3A3A" />
    {[0, 1, 2, 3, 4].map((i) => (
      <Rect key={`door-${i}`} x="15" y={29 + i * 1.2} width="10" height="0.3" fill="#2A2A2A" />
    ))}
    
    {/* Foundation */}
    <Rect x="5" y="35" width="30" height="2" fill="#4A4A4A" />
  </Svg>
);

// ============================================
// HOSPITAL - Medical facility with cross
// ============================================
export const HospitalIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="hospitalWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="100%" stopColor="#E8E8E8" />
      </LinearGradient>
      <LinearGradient id="crossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FF4444" />
        <Stop offset="100%" stopColor="#CC0000" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="14" ry="2" fill="rgba(0,0,0,0.2)" />
    
    {/* Main building */}
    <Rect x="6" y="12" width="28" height="24" fill="url(#hospitalWallGrad)" rx="1" />
    <Rect x="6" y="12" width="2" height="24" fill="rgba(255,255,255,0.5)" />
    
    {/* Roof/cornice */}
    <Rect x="4" y="10" width="32" height="4" fill="#E0E0E0" />
    <Rect x="4" y="10" width="32" height="1" fill="#F5F5F5" />
    
    {/* Red cross */}
    <Rect x="17" y="14" width="6" height="14" fill="url(#crossGrad)" rx="0.5" />
    <Rect x="13" y="18" width="14" height="6" fill="url(#crossGrad)" rx="0.5" />
    {/* Cross highlight */}
    <Rect x="17" y="14" width="1.5" height="14" fill="rgba(255,255,255,0.3)" />
    <Rect x="13" y="18" width="14" height="1.5" fill="rgba(255,255,255,0.3)" />
    
    {/* Entrance */}
    <Rect x="15" y="28" width="10" height="8" fill="#4FC3F7" rx="1" />
    <Line x1="20" y1="28" x2="20" y2="36" stroke="#fff" strokeWidth="1" />
    <Rect x="15" y="28" width="10" height="2" fill="rgba(255,255,255,0.3)" />
    
    {/* Side windows */}
    <Rect x="8" y="16" width="4" height="5" fill="#4FC3F7" rx="0.5" />
    <Rect x="8" y="16" width="1.5" height="2" fill="rgba(255,255,255,0.4)" />
    <Rect x="28" y="16" width="4" height="5" fill="#4FC3F7" rx="0.5" />
    <Rect x="28" y="16" width="1.5" height="2" fill="rgba(255,255,255,0.4)" />
    <Rect x="8" y="24" width="4" height="5" fill="#4FC3F7" rx="0.5" />
    <Rect x="28" y="24" width="4" height="5" fill="#4FC3F7" rx="0.5" />
    
    {/* Foundation */}
    <Rect x="6" y="35" width="28" height="2" fill="#CCCCCC" />
  </Svg>
);

// ============================================
// SCHOOL - Educational building with bell tower
// ============================================
export const SchoolIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="schoolWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FFCC80" />
        <Stop offset="100%" stopColor="#E6A94D" />
      </LinearGradient>
      <LinearGradient id="schoolRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#A0522D" />
        <Stop offset="100%" stopColor="#6B3510" />
      </LinearGradient>
      <LinearGradient id="schoolWindowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#B0E0E6" />
        <Stop offset="50%" stopColor="#87CEEB" />
        <Stop offset="100%" stopColor="#6CA6CD" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="15" ry="2" fill="rgba(0,0,0,0.2)" />
    
    {/* Main building */}
    <Rect x="6" y="18" width="28" height="18" fill="url(#schoolWallGrad)" rx="1" />
    <Rect x="6" y="18" width="2" height="18" fill="rgba(255,255,255,0.3)" />
    
    {/* Bell tower */}
    <Rect x="16" y="8" width="8" height="12" fill="url(#schoolWallGrad)" />
    <Rect x="16" y="8" width="1.5" height="12" fill="rgba(255,255,255,0.3)" />
    <Polygon points="15,10 20,3 25,10" fill="url(#schoolRoofGrad)" />
    <Polygon points="15,10 20,3 20,5 16,10" fill="rgba(255,255,255,0.2)" />
    
    {/* Bell */}
    <Ellipse cx="20" cy="12" rx="2.5" ry="2" fill="#FFD700" />
    <Ellipse cx="20" cy="12" rx="2.5" ry="2" fill="rgba(255,255,255,0.3)" />
    <Rect x="19" y="13.5" width="2" height="2" fill="#B8860B" />
    
    {/* Main roof */}
    <Polygon points="4,20 20,10 36,20" fill="url(#schoolRoofGrad)" />
    <Polygon points="4,20 20,10 20,12 6,20" fill="rgba(255,255,255,0.15)" />
    
    {/* Clock */}
    <Circle cx="20" cy="22" r="3" fill="#FFFFFF" stroke="#333" strokeWidth="0.5" />
    <Line x1="20" y1="22" x2="20" y2="20" stroke="#333" strokeWidth="0.7" />
    <Line x1="20" y1="22" x2="21.5" y2="22.5" stroke="#333" strokeWidth="0.5" />
    
    {/* Door */}
    <Rect x="17" y="28" width="6" height="8" fill="#5D4037" rx="0.5" />
    <Rect x="17.5" y="28.5" width="5" height="7" fill="#8B4513" rx="0.5" />
    <Circle cx="21.5" cy="32" r="0.5" fill="#FFD700" />
    
    {/* Windows */}
    <Rect x="8" y="22" width="5" height="5" fill="url(#schoolWindowGrad)" rx="0.5" />
    <Rect x="8" y="22" width="1.5" height="2" fill="rgba(255,255,255,0.4)" />
    <Rect x="27" y="22" width="5" height="5" fill="url(#schoolWindowGrad)" rx="0.5" />
    <Rect x="27" y="22" width="1.5" height="2" fill="rgba(255,255,255,0.4)" />
    <Rect x="8" y="29" width="5" height="5" fill="url(#schoolWindowGrad)" rx="0.5" />
    <Rect x="27" y="29" width="5" height="5" fill="url(#schoolWindowGrad)" rx="0.5" />
    
    {/* Foundation */}
    <Rect x="6" y="35" width="28" height="2" fill="#8B7355" />
  </Svg>
);

// ============================================
// FORT - Stone fortress with flag
// ============================================
export const FortIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="stoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#909090" />
        <Stop offset="50%" stopColor="#707070" />
        <Stop offset="100%" stopColor="#505050" />
      </LinearGradient>
      <LinearGradient id="flagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FF4444" />
        <Stop offset="100%" stopColor="#CC0000" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="16" ry="2" fill="rgba(0,0,0,0.2)" />
    
    {/* Main fort body */}
    <Rect x="5" y="16" width="30" height="20" fill="url(#stoneGrad)" rx="1" />
    <Rect x="5" y="16" width="2" height="20" fill="rgba(255,255,255,0.15)" />
    
    {/* Crenellations */}
    {[7, 14, 21, 28].map((x, i) => (
      <Rect key={`cren-${i}`} x={x} y="12" width="5" height="6" fill="url(#stoneGrad)" />
    ))}
    {[7, 14, 21, 28].map((x, i) => (
      <Rect key={`crenH-${i}`} x={x} y="12" width="1" height="6" fill="rgba(255,255,255,0.1)" />
    ))}
    
    {/* Flag pole */}
    <Rect x="19" y="2" width="2" height="14" fill="#5D4037" />
    <Rect x="19" y="2" width="0.5" height="14" fill="rgba(255,255,255,0.2)" />
    
    {/* Flag */}
    <Path d="M21,3 Q28,5 21,8 Q28,10 21,12 L21,3" fill="url(#flagGrad)" />
    <Path d="M21,3 Q24,4 21,5.5" fill="rgba(255,255,255,0.2)" />
    
    {/* Gate arch */}
    <Path d="M14,36 L14,24 Q20,18 26,24 L26,36 Z" fill="#404040" />
    
    {/* Portcullis */}
    {[16, 20, 24].map((x, i) => (
      <Line key={`pv-${i}`} x1={x} y1="24" x2={x} y2="36" stroke="#222" strokeWidth="1" />
    ))}
    {[28, 32].map((y, i) => (
      <Line key={`ph-${i}`} x1="14" y1={y} x2="26" y2={y} stroke="#222" strokeWidth="1" />
    ))}
    
    {/* Stone texture lines */}
    <Line x1="5" y1="22" x2="14" y2="22" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
    <Line x1="26" y1="22" x2="35" y2="22" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
    <Line x1="5" y1="28" x2="14" y2="28" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
    <Line x1="26" y1="28" x2="35" y2="28" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
    
    {/* Arrow slits */}
    <Rect x="8" y="24" width="2" height="6" fill="#222" rx="0.5" />
    <Rect x="30" y="24" width="2" height="6" fill="#222" rx="0.5" />
  </Svg>
);

// ============================================
// APARTMENT - Multi-story residential (Enhanced)
// ============================================
export const ApartmentIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="aptWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#B0A090" />
        <Stop offset="50%" stopColor="#A09080" />
        <Stop offset="100%" stopColor="#807060" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="12" ry="2" fill="rgba(0,0,0,0.2)" />
    
    {/* Main building */}
    <Rect x="8" y="6" width="24" height="30" fill="url(#aptWallGrad)" rx="1" />
    <Rect x="8" y="6" width="2" height="30" fill="rgba(255,255,255,0.2)" />
    
    {/* Roof */}
    <Rect x="6" y="4" width="28" height="4" fill="#606060" />
    <Rect x="6" y="4" width="28" height="1" fill="#707070" />
    
    {/* Windows grid */}
    {[0, 1, 2, 3].map((row) => (
      <G key={`row-${row}`}>
        {[0, 1, 2].map((col) => (
          <G key={`win-${row}-${col}`}>
            <Rect x={11 + col * 7} y={9 + row * 7} width="4" height="5" fill="#3A5A7A" rx="0.3" />
            <Rect x={11 + col * 7} y={9 + row * 7} width="1.2" height="1.5" fill="rgba(255,255,255,0.3)" />
          </G>
        ))}
      </G>
    ))}
    
    {/* Entrance */}
    <Rect x="16" y="30" width="8" height="6" fill="#4A3A2A" rx="0.5" />
    <Rect x="17" y="31" width="6" height="5" fill="#5A4A3A" rx="0.3" />
    <Rect x="17" y="31" width="6" height="1" fill="rgba(255,255,255,0.2)" />
    
    {/* Balconies */}
    <Rect x="10" y="15" width="6" height="0.8" fill="#505050" />
    <Rect x="24" y="15" width="6" height="0.8" fill="#505050" />
    <Rect x="10" y="22" width="6" height="0.8" fill="#505050" />
    <Rect x="24" y="22" width="6" height="0.8" fill="#505050" />
  </Svg>
);

// ============================================
// DOCK - Wooden pier (Enhanced)
// ============================================
export const DockIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#1A5276" />
        <Stop offset="100%" stopColor="#0D3D5C" />
      </LinearGradient>
      <LinearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#DEB887" />
        <Stop offset="50%" stopColor="#C4A06A" />
        <Stop offset="100%" stopColor="#A08050" />
      </LinearGradient>
    </Defs>
    
    {/* Water */}
    <Rect x="0" y="20" width="40" height="20" fill="url(#waterGrad)" />
    
    {/* Wave lines */}
    <Path d="M0,25 Q10,23 20,25 Q30,27 40,25" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
    <Path d="M0,32 Q10,30 20,32 Q30,34 40,32" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
    
    {/* Pier platform */}
    <Rect x="5" y="16" width="30" height="6" fill="url(#woodGrad)" rx="1" />
    <Rect x="5" y="16" width="30" height="1" fill="rgba(255,255,255,0.2)" />
    
    {/* Planks */}
    {[8, 14, 20, 26, 32].map((x, i) => (
      <Line key={`plank-${i}`} x1={x} y1="16" x2={x} y2="22" stroke="#8B7355" strokeWidth="0.5" />
    ))}
    
    {/* Support posts */}
    <Rect x="8" y="20" width="3" height="16" fill="#8B7355" />
    <Rect x="8" y="20" width="0.8" height="16" fill="rgba(255,255,255,0.15)" />
    <Rect x="29" y="20" width="3" height="16" fill="#8B7355" />
    <Rect x="29" y="20" width="0.8" height="16" fill="rgba(255,255,255,0.15)" />
    
    {/* Mooring posts */}
    <Rect x="12" y="12" width="2" height="8" fill="#6B5344" />
    <Circle cx="13" cy="12" r="1.5" fill="#5D4037" />
    <Rect x="26" y="12" width="2" height="8" fill="#6B5344" />
    <Circle cx="27" cy="12" r="1.5" fill="#5D4037" />
    
    {/* Rope */}
    <Path d="M13,13 Q18,16 20,14 Q22,12 27,13" stroke="#C4A06A" strokeWidth="0.8" fill="none" />
    
    {/* Crate */}
    <Rect x="18" y="12" width="5" height="4" fill="#A08050" />
    <Line x1="18" y1="14" x2="23" y2="14" stroke="#8B7355" strokeWidth="0.5" />
    <Rect x="18" y="12" width="5" height="1" fill="rgba(255,255,255,0.15)" />
  </Svg>
);

// ============================================
// LIGHTHOUSE - Coastal beacon (Enhanced)
// ============================================
export const LighthouseIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="lighthouseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="50%" stopColor="#F0F0F0" />
        <Stop offset="100%" stopColor="#D0D0D0" />
      </LinearGradient>
      <RadialGradient id="lightGrad" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(255,255,150,0.9)" />
        <Stop offset="50%" stopColor="rgba(255,255,100,0.4)" />
        <Stop offset="100%" stopColor="rgba(255,255,0,0)" />
      </RadialGradient>
    </Defs>
    
    {/* Light beam glow */}
    <Circle cx="20" cy="8" r="8" fill="url(#lightGrad)" />
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="10" ry="2" fill="rgba(0,0,0,0.2)" />
    
    {/* Main tower - tapered */}
    <Path d="M14,36 L16,12 L24,12 L26,36 Z" fill="url(#lighthouseGrad)" />
    <Path d="M14,36 L16,12 L17,12 L15,36 Z" fill="rgba(255,255,255,0.3)" />
    
    {/* Red stripes */}
    <Path d="M15.2,30 L16.4,18 L23.6,18 L24.8,30 Z" fill="#E53935" />
    <Path d="M14.6,36 L15.2,30 L24.8,30 L25.4,36 Z" fill="#E53935" />
    
    {/* Lantern room */}
    <Rect x="15" y="8" width="10" height="5" fill="#333" />
    <Rect x="16" y="9" width="8" height="3" fill="#FFE082" />
    
    {/* Dome */}
    <Path d="M15,8 Q20,3 25,8 Z" fill="#333" />
    <Path d="M15,8 Q17,5 20,4" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
    
    {/* Gallery railing */}
    <Rect x="14" y="12" width="12" height="1" fill="#333" />
    <Rect x="14" y="11" width="12" height="1" fill="#555" />
    
    {/* Windows */}
    <Ellipse cx="20" cy="22" rx="2" ry="2.5" fill="#4A6A8A" />
    <Ellipse cx="20" cy="22" rx="2" ry="2.5" fill="rgba(255,255,255,0.2)" />
    
    {/* Door */}
    <Path d="M18,36 L18,32 Q20,30 22,32 L22,36 Z" fill="#5D4037" />
    
    {/* Base/rocks */}
    <Ellipse cx="20" cy="36" rx="8" ry="2" fill="#696969" />
  </Svg>
);

// ============================================
// GRANARY - Food storage (Enhanced)
// ============================================
export const GranaryIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="siloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#DAA520" />
        <Stop offset="30%" stopColor="#C4941A" />
        <Stop offset="100%" stopColor="#A07818" />
      </LinearGradient>
      <LinearGradient id="roofSiloGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#8B4513" />
        <Stop offset="100%" stopColor="#5D2906" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="12" ry="2" fill="rgba(0,0,0,0.2)" />
    
    {/* Main silo body */}
    <Rect x="10" y="14" width="20" height="22" fill="url(#siloGrad)" rx="10" />
    <Rect x="10" y="14" width="3" height="22" fill="rgba(255,255,255,0.2)" />
    
    {/* Silo top dome */}
    <Ellipse cx="20" cy="14" rx="10" ry="4" fill="url(#siloGrad)" />
    <Ellipse cx="20" cy="14" rx="10" ry="4" fill="rgba(255,255,255,0.1)" />
    
    {/* Conical roof */}
    <Path d="M10,14 Q20,2 30,14 Z" fill="url(#roofSiloGrad)" />
    <Path d="M10,14 Q15,8 20,4" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
    
    {/* Ventilator cap */}
    <Rect x="18" y="4" width="4" height="3" fill="#5D4037" />
    <Rect x="17" y="3" width="6" height="2" fill="#8B4513" />
    
    {/* Metal bands */}
    <Rect x="10" y="18" width="20" height="1" fill="#8B7355" />
    <Rect x="10" y="26" width="20" height="1" fill="#8B7355" />
    
    {/* Access door */}
    <Rect x="16" y="28" width="8" height="7" fill="#5D4037" rx="0.5" />
    <Rect x="17" y="29" width="6" height="5" fill="#8B4513" rx="0.3" />
    <Circle cx="21.5" cy="31.5" r="0.6" fill="#FFD700" />
    
    {/* Grain pile at base */}
    <Ellipse cx="20" cy="35" rx="8" ry="2" fill="#D4A017" />
    <Ellipse cx="20" cy="35" rx="6" ry="1.5" fill="#E4B027" />
  </Svg>
);

// ============================================
// MARKETPLACE - Trade center (Enhanced)
// ============================================
export const MarketplaceIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="awningGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#E53935" />
        <Stop offset="100%" stopColor="#B71C1C" />
      </LinearGradient>
      <LinearGradient id="awningGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#1E88E5" />
        <Stop offset="100%" stopColor="#0D47A1" />
      </LinearGradient>
      <LinearGradient id="awningGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#43A047" />
        <Stop offset="100%" stopColor="#1B5E20" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="16" ry="2" fill="rgba(0,0,0,0.15)" />
    
    {/* Ground/platform */}
    <Rect x="2" y="32" width="36" height="5" fill="#C4A06A" />
    <Rect x="2" y="32" width="36" height="1" fill="rgba(255,255,255,0.2)" />
    
    {/* Stall 1 - Red */}
    <Rect x="3" y="22" width="10" height="12" fill="#DEB887" />
    <Path d="M2,14 L8,8 L14,14 Z" fill="url(#awningGrad1)" />
    <Rect x="3" y="14" width="10" height="2" fill="url(#awningGrad1)" />
    {/* Scalloped edge */}
    <Path d="M3,16 Q5,18 8,16 Q11,18 13,16" fill="url(#awningGrad1)" />
    {/* Goods */}
    <Circle cx="6" cy="28" r="2" fill="#FF6B6B" />
    <Circle cx="10" cy="28" r="2" fill="#FF8A80" />
    
    {/* Stall 2 - Blue (center, larger) */}
    <Rect x="15" y="20" width="10" height="14" fill="#DEB887" />
    <Path d="M14,12 L20,4 L26,12 Z" fill="url(#awningGrad2)" />
    <Rect x="15" y="12" width="10" height="2" fill="url(#awningGrad2)" />
    <Path d="M15,14 Q17.5,16 20,14 Q22.5,16 25,14" fill="url(#awningGrad2)" />
    {/* Goods */}
    <Rect x="17" y="26" width="3" height="4" fill="#FFD54F" />
    <Rect x="21" y="27" width="2" height="3" fill="#81C784" />
    
    {/* Stall 3 - Green */}
    <Rect x="27" y="22" width="10" height="12" fill="#DEB887" />
    <Path d="M26,14 L32,8 L38,14 Z" fill="url(#awningGrad3)" />
    <Rect x="27" y="14" width="10" height="2" fill="url(#awningGrad3)" />
    <Path d="M27,16 Q30,18 32,16 Q35,18 37,16" fill="url(#awningGrad3)" />
    {/* Goods */}
    <Ellipse cx="31" cy="28" rx="2" ry="1.5" fill="#8D6E63" />
    <Ellipse cx="35" cy="28" rx="1.5" ry="1.5" fill="#A1887F" />
    
    {/* Support poles */}
    <Rect x="7" y="14" width="1.5" height="20" fill="#5D4037" />
    <Rect x="19" y="12" width="1.5" height="22" fill="#5D4037" />
    <Rect x="31" y="14" width="1.5" height="20" fill="#5D4037" />
  </Svg>
);

// ============================================
// WATCHTOWER - Lookout post (Enhanced)
// ============================================
export const WatchtowerIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="woodTowerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#8B7355" />
        <Stop offset="50%" stopColor="#7A6348" />
        <Stop offset="100%" stopColor="#5D4E37" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="8" ry="2" fill="rgba(0,0,0,0.2)" />
    
    {/* Base supports - crossed */}
    <Path d="M12,36 L16,20" stroke="url(#woodTowerGrad)" strokeWidth="3" />
    <Path d="M28,36 L24,20" stroke="url(#woodTowerGrad)" strokeWidth="3" />
    <Path d="M16,36 L20,20" stroke="url(#woodTowerGrad)" strokeWidth="2" />
    <Path d="M24,36 L20,20" stroke="url(#woodTowerGrad)" strokeWidth="2" />
    
    {/* Cross braces */}
    <Line x1="14" y1="28" x2="26" y2="28" stroke="#5D4E37" strokeWidth="1.5" />
    <Line x1="15" y1="32" x2="25" y2="32" stroke="#5D4E37" strokeWidth="1.5" />
    
    {/* Platform */}
    <Rect x="12" y="18" width="16" height="3" fill="url(#woodTowerGrad)" />
    <Rect x="12" y="18" width="16" height="0.8" fill="rgba(255,255,255,0.15)" />
    
    {/* Cabin */}
    <Rect x="14" y="8" width="12" height="11" fill="url(#woodTowerGrad)" />
    <Rect x="14" y="8" width="1.5" height="11" fill="rgba(255,255,255,0.15)" />
    
    {/* Roof */}
    <Polygon points="12,9 20,2 28,9" fill="#5D4037" />
    <Polygon points="12,9 20,2 20,4 14,9" fill="rgba(255,255,255,0.1)" />
    
    {/* Windows */}
    <Rect x="16" y="10" width="3" height="4" fill="#4A6A8A" rx="0.3" />
    <Rect x="21" y="10" width="3" height="4" fill="#4A6A8A" rx="0.3" />
    <Rect x="16" y="10" width="1" height="1.5" fill="rgba(255,255,255,0.3)" />
    <Rect x="21" y="10" width="1" height="1.5" fill="rgba(255,255,255,0.3)" />
    
    {/* Railing */}
    <Line x1="12" y1="18" x2="12" y2="15" stroke="#5D4037" strokeWidth="1" />
    <Line x1="28" y1="18" x2="28" y2="15" stroke="#5D4037" strokeWidth="1" />
    <Line x1="12" y1="15" x2="14" y2="15" stroke="#5D4037" strokeWidth="1" />
    <Line x1="26" y1="15" x2="28" y2="15" stroke="#5D4037" strokeWidth="1" />
    
    {/* Ladder */}
    <Rect x="19" y="20" width="2" height="16" fill="#6B5344" />
    {[22, 25, 28, 31, 34].map((y, i) => (
      <Line key={`rung-${i}`} x1="18" y1={y} x2="22" y2={y} stroke="#8B7355" strokeWidth="1" />
    ))}
  </Svg>
);

// ============================================
// FISHING BOAT - Small vessel
// ============================================
export const FishingBoatIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="boatHullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#8B4513" />
        <Stop offset="100%" stopColor="#5D2906" />
      </LinearGradient>
      <LinearGradient id="waterBoatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#1A5276" />
        <Stop offset="100%" stopColor="#0D3D5C" />
      </LinearGradient>
    </Defs>
    
    {/* Water */}
    <Rect x="0" y="28" width="40" height="12" fill="url(#waterBoatGrad)" />
    <Path d="M0,32 Q10,30 20,32 Q30,34 40,32" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" fill="none" />
    
    {/* Hull */}
    <Path d="M6,28 Q8,36 20,36 Q32,36 34,28 Z" fill="url(#boatHullGrad)" />
    <Path d="M6,28 Q8,34 15,35" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" />
    
    {/* Deck */}
    <Rect x="8" y="26" width="24" height="3" fill="#A0522D" rx="1" />
    <Rect x="8" y="26" width="24" height="0.8" fill="rgba(255,255,255,0.15)" />
    
    {/* Cabin */}
    <Rect x="22" y="18" width="8" height="9" fill="#DEB887" rx="1" />
    <Rect x="22" y="18" width="1.5" height="9" fill="rgba(255,255,255,0.2)" />
    <Rect x="24" y="20" width="4" height="3" fill="#4A6A8A" rx="0.3" />
    
    {/* Mast */}
    <Rect x="14" y="6" width="2" height="21" fill="#5D4037" />
    <Rect x="14" y="6" width="0.5" height="21" fill="rgba(255,255,255,0.15)" />
    
    {/* Boom */}
    <Line x1="15" y1="16" x2="28" y2="20" stroke="#5D4037" strokeWidth="1.5" />
    
    {/* Net */}
    <Path d="M10,22 Q12,28 10,30" stroke="#C4A06A" strokeWidth="0.8" fill="none" />
    <Path d="M10,22 L8,28 L10,30" stroke="#C4A06A" strokeWidth="0.8" fill="none" />
    <Path d="M10,22 L12,28 L10,30" stroke="#C4A06A" strokeWidth="0.8" fill="none" />
    
    {/* Flag */}
    <Path d="M16,6 L22,8 L16,10 Z" fill="#4CAF50" />
  </Svg>
);

// ============================================
// PT BOAT - Military patrol boat
// ============================================
export const PTBoatIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="ptHullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#607D8B" />
        <Stop offset="100%" stopColor="#37474F" />
      </LinearGradient>
      <LinearGradient id="ptDeckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#78909C" />
        <Stop offset="100%" stopColor="#546E7A" />
      </LinearGradient>
      <LinearGradient id="ptWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#1A5276" />
        <Stop offset="100%" stopColor="#0D3D5C" />
      </LinearGradient>
    </Defs>
    
    {/* Water */}
    <Rect x="0" y="28" width="40" height="12" fill="url(#ptWaterGrad)" />
    <Path d="M0,31 Q10,29 20,31 Q30,33 40,31" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" fill="none" />
    
    {/* Wake spray */}
    <Path d="M4,30 Q2,28 4,26" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
    <Path d="M6,32 Q3,30 5,27" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" />
    
    {/* Hull - sleek military shape */}
    <Path d="M4,28 L8,32 Q20,34 32,32 L36,26 L34,28 Q20,30 6,28 Z" fill="url(#ptHullGrad)" />
    
    {/* Deck */}
    <Path d="M6,26 L34,26 Q36,26 35,24 L10,24 Q8,24 6,26 Z" fill="url(#ptDeckGrad)" />
    <Path d="M6,26 L10,24" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
    
    {/* Bridge/cabin */}
    <Rect x="18" y="16" width="10" height="9" fill="#455A64" rx="1" />
    <Rect x="18" y="16" width="1.5" height="9" fill="rgba(255,255,255,0.15)" />
    <Rect x="20" y="17" width="6" height="4" fill="#263238" rx="0.5" />
    <Rect x="20" y="17" width="2" height="1.5" fill="rgba(100,200,255,0.3)" />
    
    {/* Forward gun turret */}
    <Circle cx="12" cy="22" r="3" fill="#37474F" />
    <Rect x="10" y="14" width="4" height="8" fill="#455A64" rx="0.5" />
    <Rect x="11" y="10" width="2" height="6" fill="#37474F" />
    
    {/* Antenna/mast */}
    <Rect x="23" y="8" width="1" height="9" fill="#455A64" />
    <Line x1="21" y1="10" x2="26" y2="10" stroke="#455A64" strokeWidth="0.5" />
    
    {/* Rear gun */}
    <Circle cx="30" cy="22" r="2" fill="#37474F" />
    <Rect x="29" y="18" width="2" height="4" fill="#455A64" />
    
    {/* Navy marking */}
    <Circle cx="24" cy="28" r="1.5" fill="#FFFFFF" />
    <Path d="M23,28 L25,28 M24,27 L24,29" stroke="#1565C0" strokeWidth="0.8" />
  </Svg>
);

// ============================================
// CONSTRUCTION - Building in progress
// ============================================
export const ConstructionIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="craneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FFA000" />
        <Stop offset="100%" stopColor="#FF6F00" />
      </LinearGradient>
    </Defs>
    
    {/* Drop shadow */}
    <Ellipse cx="20" cy="37" rx="12" ry="2" fill="rgba(0,0,0,0.15)" />
    
    {/* Foundation/base */}
    <Rect x="10" y="30" width="20" height="6" fill="#9E9E9E" />
    <Rect x="10" y="30" width="20" height="1" fill="rgba(255,255,255,0.2)" />
    
    {/* Partial walls */}
    <Rect x="10" y="20" width="4" height="12" fill="#BDBDBD" />
    <Rect x="26" y="24" width="4" height="8" fill="#BDBDBD" />
    
    {/* Scaffolding */}
    <G stroke="#8D6E63" strokeWidth="1">
      <Line x1="8" y1="36" x2="8" y2="14" />
      <Line x1="32" y1="36" x2="32" y2="18" />
      <Line x1="8" y1="20" x2="32" y2="20" />
      <Line x1="8" y1="28" x2="32" y2="28" />
    </G>
    
    {/* Crane arm */}
    <Rect x="18" y="4" width="4" height="28" fill="url(#craneGrad)" />
    <Rect x="6" y="4" width="20" height="3" fill="url(#craneGrad)" />
    
    {/* Crane hook and cable */}
    <Line x1="10" y1="7" x2="10" y2="16" stroke="#424242" strokeWidth="0.8" />
    <Path d="M8,16 Q10,20 12,16" stroke="#424242" strokeWidth="1.5" fill="none" />
    
    {/* Bricks/materials */}
    <Rect x="14" y="32" width="3" height="2" fill="#D84315" />
    <Rect x="18" y="32" width="3" height="2" fill="#D84315" />
    <Rect x="16" y="30" width="3" height="2" fill="#E64A19" />
    
    {/* Warning stripes on crane */}
    <G>
      <Line x1="6" y1="5" x2="8" y2="5" stroke="#212121" strokeWidth="1" />
      <Line x1="10" y1="5" x2="12" y2="5" stroke="#212121" strokeWidth="1" />
      <Line x1="14" y1="5" x2="16" y2="5" stroke="#212121" strokeWidth="1" />
    </G>
  </Svg>
);

// Export for backwards compatibility
export const HouseIconOld = HouseIcon;
export const FarmIconOld = FarmIcon;
export const FactoryIconOld = FactoryIcon;
export const HospitalIconOld = HospitalIcon;
export const SchoolIconOld = SchoolIcon;
export const FortIconOld = FortIcon;

export default {
  HouseIcon,
  FarmIcon,
  FactoryIcon,
  HospitalIcon,
  SchoolIcon,
  FortIcon,
  ApartmentIcon,
  DockIcon,
  LighthouseIcon,
  GranaryIcon,
  MarketplaceIcon,
  WatchtowerIcon,
  FishingBoatIcon,
  PTBoatIcon,
  ConstructionIcon,
};
