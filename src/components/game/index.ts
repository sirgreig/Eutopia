// src/components/game/index.ts
// Export all game components

export { Island } from './Island';
export { AnimatedBoat } from './AnimatedBoat';
export { AnimatedBuildMenu } from './AnimatedBuildMenu';
export { AnimatedResourceBar } from './AnimatedResourceBar';
export { 
  AnimatedHouseIcon,
  AnimatedFactoryIcon,
  AnimatedFarmIcon,
  AnimatedHospitalIcon,
  AnimatedSchoolIcon,
  AnimatedFortIcon,
  AnimatedIcons,
} from './AnimatedIcons';
export { EndGameSummary } from './EndGameSummary';

// Re-export Icons (if they exist as separate file)
export * from './Icons';
