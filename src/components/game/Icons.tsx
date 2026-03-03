// src/components/game/Icons.tsx
// Building and boat icons using PNG images
// Images located in assets/images/

import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Svg, { Rect, Circle, Path, G, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
}

// Image source mappings (exported for preloading in App.tsx)
export const ICON_IMAGES: Record<string, ImageSourcePropType> = {
  house: require('../../../assets/images/houseTile.png'),
  farm: require('../../../assets/images/cropTile.png'),
  factory: require('../../../assets/images/factoryTile.png'),
  hospital: require('../../../assets/images/hospitalTile.png'),
  school: require('../../../assets/images/schoolTile.png'),
  fort: require('../../../assets/images/fortTile.png'),
  apartment: require('../../../assets/images/apartmentTile.png'),
  dock: require('../../../assets/images/dockTile.png'),
  lighthouse: require('../../../assets/images/lighthouseTile.png'),
  granary: require('../../../assets/images/granaryTile.png'),
  marketplace: require('../../../assets/images/marketplaceTile.png'),
  watchtower: require('../../../assets/images/watchtowerTile.png'),
  fishingBoat: require('../../../assets/images/fishingboatTile.png'),
  ptBoat: require('../../../assets/images/ptTile.png'),
};

// Reusable PNG icon component
const PngIcon = ({ source, size = 40 }: { source: ImageSourcePropType; size?: number }) => (
  <Image
    source={source}
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);

// Building icons
export const HouseIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.house} size={size} />
);

export const FarmIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.farm} size={size} />
);

export const FactoryIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.factory} size={size} />
);

export const HospitalIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.hospital} size={size} />
);

export const SchoolIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.school} size={size} />
);

export const FortIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.fort} size={size} />
);

// Enhanced mode building icons
export const ApartmentIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.apartment} size={size} />
);

export const DockIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.dock} size={size} />
);

export const LighthouseIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.lighthouse} size={size} />
);

export const GranaryIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.granary} size={size} />
);

export const MarketplaceIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.marketplace} size={size} />
);

export const WatchtowerIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.watchtower} size={size} />
);

// Boat icons
export const FishingBoatIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.fishingBoat} size={size} />
);

export const PTBoatIcon = ({ size = 40 }: IconProps) => (
  <PngIcon source={ICON_IMAGES.ptBoat} size={size} />
);

// Construction placeholder (kept as simple SVG since there's no PNG for it)
export const ConstructionIcon = ({ size = 40 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Rect x="8" y="20" width="24" height="16" fill="#8B7355" rx="2" />
    <Path d="M6 20 L20 8 L34 20 Z" fill="#A0522D" />
    <Rect x="16" y="24" width="8" height="12" fill="#DEB887" rx="1" />
    <Circle cx="22" cy="30" r="1" fill="#333" />
    {/* Scaffolding */}
    <Line x1="4" y1="36" x2="4" y2="10" stroke="#FFD700" strokeWidth="1.5" />
    <Line x1="36" y1="36" x2="36" y2="10" stroke="#FFD700" strokeWidth="1.5" />
    <Line x1="4" y1="15" x2="36" y2="15" stroke="#FFD700" strokeWidth="1.5" />
    <Line x1="4" y1="25" x2="36" y2="25" stroke="#FFD700" strokeWidth="1.5" />
  </Svg>
);

// Legacy aliases for backward compatibility
export const HouseIconOld = HouseIcon;
export const FarmIconOld = FarmIcon;
export const FactoryIconOld = FactoryIcon;
export const HospitalIconOld = HospitalIcon;
export const SchoolIconOld = SchoolIcon;
export const FortIconOld = FortIcon;

// Utility: get icon image source by building type (for use outside components)
export const getIconSource = (type: string): ImageSourcePropType | null => {
  return ICON_IMAGES[type] ?? null;
};

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
