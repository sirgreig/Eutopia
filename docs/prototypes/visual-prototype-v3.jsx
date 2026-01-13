import React, { useState } from 'react';

// Eutopía Visual Prototype v3
// Modern, clean, visually appealing with detailed icons
// Scaled for iPhone display (375-428pt width)

const COLORS = {
  // Water palette
  waterDeep: '#1a4b6e',
  waterMid: '#2d6a8e',
  waterLight: '#4a8fad',
  waterHighlight: '#6bb3d0',
  
  // Land palette
  land: '#5cb85c',
  landLight: '#7ed07e',
  landDark: '#3d8b3d',
  landEdge: '#2d6b2d',
  
  // Buildings
  house: '#e8a838',
  houseRoof: '#c4872a',
  houseDoor: '#6b4423',
  houseWindow: '#87ceeb',
  
  factory: '#708090',
  factoryDark: '#556677',
  factoryChimney: '#4a5560',
  factorySmoke: '#c8d0d8',
  factoryWindow: '#f0c040',
  
  farm: '#7cb342',
  farmDark: '#5a9020',
  farmCrop: '#9ccc65',
  
  fort: '#8b6f4e',
  fortDark: '#6b5030',
  fortStone: '#a08060',
  
  hospital: '#f5f5f5',
  hospitalCross: '#e53935',
  hospitalRoof: '#d0d0d0',
  
  school: '#5c6bc0',
  schoolDark: '#3f4fa0',
  schoolBell: '#ffd700',
  schoolWindow: '#87ceeb',
  
  // Enhanced buildings
  dock: '#8d6e63',
  lighthouse: '#f5f5dc',
  lighthouseStripe: '#e53935',
  
  // UI
  panel: '#1a2530',
  panelLight: '#2d3d4d',
  panelBorder: '#3d5060',
  text: '#eceff1',
  textDim: '#78909c',
  gold: '#ffc107',
  
  // Boats
  fishingBoat: '#ffd54f',
  fishingBoatDark: '#c9a030',
  ptBoat: '#90a4ae',
  ptBoatDark: '#607080',
  ptBoatGun: '#455a64',
  
  // Effects
  fog: 'rgba(26, 37, 48, 0.7)',
  selected: '#4caf50',
  cursor: '#ffffff',
  rain: '#64b5f6',
};

// iPhone-friendly dimensions
const TILE_SIZE = 48;
const CANVAS_WIDTH = 390;
const CANVAS_HEIGHT = 520;
const GRID_OFFSET_X = 20;
const GRID_OFFSET_Y = 70;

// Island tiles
const ISLAND_TILES = [
  { x: 3, y: 0 }, { x: 4, y: 0 },
  { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
  { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 },
  { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
  { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
  { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
  { x: 5, y: 6 }, { x: 6, y: 6 },
];

const BUILDINGS = [
  { x: 3, y: 1, type: 'fort' },
  { x: 4, y: 1, type: 'house' },
  { x: 2, y: 2, type: 'farm' },
  { x: 3, y: 2, type: 'factory' },
  { x: 4, y: 2, type: 'house' },
  { x: 5, y: 2, type: 'hospital' },
  { x: 2, y: 3, type: 'farm' },
  { x: 3, y: 3, type: 'school' },
  { x: 4, y: 4, type: 'farm' },
  { x: 5, y: 4, type: 'dock' },
];

const BOATS = [
  { x: 0.3, y: 3.5, type: 'fishing', selected: false },
  { x: 7.5, y: 2.5, type: 'pt', selected: true },
];

// Detailed building icons
const BuildingIcon = ({ type, size = 40 }) => {
  const s = size;
  
  switch (type) {
    case 'house':
      return (
        <g>
          {/* Shadow */}
          <ellipse cx={s/2} cy={s*0.92} rx={s*0.35} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
          {/* Main body */}
          <rect x={s*0.18} y={s*0.42} width={s*0.64} height={s*0.48} fill={COLORS.house} rx={2} />
          {/* Body shading */}
          <rect x={s*0.18} y={s*0.42} width={s*0.15} height={s*0.48} fill={COLORS.houseRoof} rx={2} />
          {/* Roof */}
          <polygon points={`${s/2},${s*0.12} ${s*0.1},${s*0.45} ${s*0.9},${s*0.45}`} fill={COLORS.houseRoof} />
          <polygon points={`${s/2},${s*0.12} ${s*0.1},${s*0.45} ${s/2},${s*0.38}`} fill={COLORS.houseDoor} />
          {/* Chimney */}
          <rect x={s*0.65} y={s*0.15} width={s*0.12} height={s*0.22} fill={COLORS.houseRoof} />
          <rect x={s*0.63} y={s*0.13} width={s*0.16} height={s*0.05} fill={COLORS.houseDoor} />
          {/* Chimney smoke */}
          <ellipse cx={s*0.71} cy={s*0.08} rx={s*0.04} ry={s*0.03} fill={COLORS.factorySmoke} opacity={0.5}>
            <animate attributeName="cy" values={`${s*0.08};${s*-0.02};${s*0.08}`} dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={s*0.75} cy={s*0.04} rx={s*0.03} ry={s*0.02} fill={COLORS.factorySmoke} opacity={0.3}>
            <animate attributeName="cy" values={`${s*0.04};${s*-0.06};${s*0.04}`} dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3.5s" repeatCount="indefinite" />
          </ellipse>
          {/* Door */}
          <rect x={s*0.4} y={s*0.6} width={s*0.2} height={s*0.3} fill={COLORS.houseDoor} rx={2} />
          <circle cx={s*0.55} cy={s*0.75} r={s*0.025} fill={COLORS.gold} />
          {/* Windows */}
          <rect x={s*0.24} y={s*0.5} width={s*0.12} height={s*0.14} fill={COLORS.houseWindow} rx={1} />
          <rect x={s*0.64} y={s*0.5} width={s*0.12} height={s*0.14} fill={COLORS.houseWindow} rx={1} />
          {/* Window frames */}
          <line x1={s*0.3} y1={s*0.5} x2={s*0.3} y2={s*0.64} stroke={COLORS.houseDoor} strokeWidth={1} />
          <line x1={s*0.24} y1={s*0.57} x2={s*0.36} y2={s*0.57} stroke={COLORS.houseDoor} strokeWidth={1} />
          <line x1={s*0.7} y1={s*0.5} x2={s*0.7} y2={s*0.64} stroke={COLORS.houseDoor} strokeWidth={1} />
          <line x1={s*0.64} y1={s*0.57} x2={s*0.76} y2={s*0.57} stroke={COLORS.houseDoor} strokeWidth={1} />
        </g>
      );
      
    case 'factory':
      return (
        <g>
          {/* Shadow */}
          <ellipse cx={s/2} cy={s*0.92} rx={s*0.4} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
          {/* Main building */}
          <rect x={s*0.08} y={s*0.4} width={s*0.65} height={s*0.5} fill={COLORS.factory} rx={2} />
          <rect x={s*0.08} y={s*0.4} width={s*0.12} height={s*0.5} fill={COLORS.factoryDark} rx={2} />
          {/* Tall chimney */}
          <rect x={s*0.7} y={s*0.15} width={s*0.18} height={s*0.75} fill={COLORS.factoryChimney} rx={2} />
          <rect x={s*0.68} y={s*0.12} width={s*0.22} height={s*0.06} fill={COLORS.factory} rx={1} />
          {/* Animated smoke puffs */}
          <ellipse cx={s*0.79} cy={s*0.08} rx={s*0.08} ry={s*0.05} fill={COLORS.factorySmoke} opacity={0.8}>
            <animate attributeName="cy" values={`${s*0.08};${s*-0.05};${s*0.08}`} dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
            <animate attributeName="rx" values={`${s*0.08};${s*0.12};${s*0.08}`} dur="3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={s*0.88} cy={s*0.04} rx={s*0.06} ry={s*0.04} fill={COLORS.factorySmoke} opacity={0.6}>
            <animate attributeName="cy" values={`${s*0.04};${s*-0.1};${s*0.04}`} dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="rx" values={`${s*0.06};${s*0.1};${s*0.06}`} dur="2.5s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={s*0.72} cy={s*0.02} rx={s*0.05} ry={s*0.03} fill={COLORS.factorySmoke} opacity={0.4}>
            <animate attributeName="cy" values={`${s*0.02};${s*-0.12};${s*0.02}`} dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="3.5s" repeatCount="indefinite" />
          </ellipse>
          {/* Windows (lit) */}
          <rect x={s*0.15} y={s*0.48} width={s*0.12} height={s*0.16} fill={COLORS.factoryWindow} rx={1}>
            <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
          </rect>
          <rect x={s*0.32} y={s*0.48} width={s*0.12} height={s*0.16} fill={COLORS.factoryWindow} rx={1}>
            <animate attributeName="opacity" values="1;0.8;1" dur="2.3s" repeatCount="indefinite" />
          </rect>
          <rect x={s*0.49} y={s*0.48} width={s*0.12} height={s*0.16} fill={COLORS.factoryWindow} rx={1}>
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite" />
          </rect>
          {/* Door */}
          <rect x={s*0.28} y={s*0.7} width={s*0.2} height={s*0.2} fill={COLORS.factoryDark} rx={2} />
          {/* Gear decoration - rotating */}
          <g transform={`translate(${s*0.55}, ${s*0.78})`}>
            <circle cx={0} cy={0} r={s*0.06} fill={COLORS.factoryDark} />
            <circle cx={0} cy={0} r={s*0.03} fill={COLORS.factory} />
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" additive="sum" />
          </g>
        </g>
      );
      
    case 'farm':
      return (
        <g>
          {/* Field base */}
          <rect x={s*0.05} y={s*0.05} width={s*0.9} height={s*0.9} fill={COLORS.farm} rx={4} />
          {/* Crop rows with swaying animation */}
          {[0.15, 0.35, 0.55, 0.75].map((y, i) => (
            <g key={i}>
              <rect x={s*0.1} y={s*y} width={s*0.8} height={s*0.12} fill={COLORS.farmDark} rx={2} />
              {/* Individual crops - swaying */}
              {[0.15, 0.28, 0.41, 0.54, 0.67, 0.8].map((x, j) => (
                <ellipse key={j} cx={s*x} cy={s*(y+0.06)} rx={s*0.04} ry={s*0.05} fill={COLORS.farmCrop}>
                  <animate 
                    attributeName="cx" 
                    values={`${s*x};${s*(x+0.01)};${s*x};${s*(x-0.01)};${s*x}`}
                    dur={`${1.5 + j*0.2}s`}
                    repeatCount="indefinite"
                  />
                </ellipse>
              ))}
            </g>
          ))}
          {/* Small fence posts */}
          <rect x={s*0.05} y={s*0.05} width={s*0.03} height={s*0.9} fill={COLORS.fortDark} />
          <rect x={s*0.92} y={s*0.05} width={s*0.03} height={s*0.9} fill={COLORS.fortDark} />
        </g>
      );
      
    case 'fort':
      return (
        <g>
          {/* Shadow */}
          <ellipse cx={s/2} cy={s*0.92} rx={s*0.4} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
          {/* Main wall */}
          <rect x={s*0.1} y={s*0.35} width={s*0.8} height={s*0.55} fill={COLORS.fort} rx={2} />
          <rect x={s*0.1} y={s*0.35} width={s*0.15} height={s*0.55} fill={COLORS.fortDark} />
          {/* Battlements (crenellations) */}
          {[0.1, 0.28, 0.46, 0.64, 0.82].map((x, i) => (
            <rect key={i} x={s*x} y={s*0.2} width={s*0.12} height={s*0.18} fill={i % 2 === 0 ? COLORS.fort : COLORS.fortStone} rx={1} />
          ))}
          {/* Stone texture lines */}
          <line x1={s*0.1} y1={s*0.5} x2={s*0.9} y2={s*0.5} stroke={COLORS.fortDark} strokeWidth={1} opacity={0.5} />
          <line x1={s*0.1} y1={s*0.65} x2={s*0.9} y2={s*0.65} stroke={COLORS.fortDark} strokeWidth={1} opacity={0.5} />
          {/* Gate */}
          <rect x={s*0.35} y={s*0.5} width={s*0.3} height={s*0.4} fill={COLORS.fortDark} rx={2} />
          <path d={`M ${s*0.35} ${s*0.5} Q ${s*0.5} ${s*0.4} ${s*0.65} ${s*0.5}`} fill={COLORS.fortDark} />
          {/* Gate bars */}
          <line x1={s*0.42} y1={s*0.5} x2={s*0.42} y2={s*0.9} stroke={COLORS.fortStone} strokeWidth={2} />
          <line x1={s*0.5} y1={s*0.45} x2={s*0.5} y2={s*0.9} stroke={COLORS.fortStone} strokeWidth={2} />
          <line x1={s*0.58} y1={s*0.5} x2={s*0.58} y2={s*0.9} stroke={COLORS.fortStone} strokeWidth={2} />
          {/* Flag pole */}
          <rect x={s*0.48} y={s*0.02} width={s*0.04} height={s*0.22} fill={COLORS.fortDark} />
          {/* Waving flag */}
          <g>
            <polygon points={`${s*0.52},${s*0.02} ${s*0.75},${s*0.08} ${s*0.52},${s*0.14}`} fill={COLORS.hospitalCross}>
              <animate attributeName="points" 
                values={`${s*0.52},${s*0.02} ${s*0.75},${s*0.08} ${s*0.52},${s*0.14};
                         ${s*0.52},${s*0.02} ${s*0.72},${s*0.06} ${s*0.52},${s*0.14};
                         ${s*0.52},${s*0.02} ${s*0.75},${s*0.08} ${s*0.52},${s*0.14}`}
                dur="2s" repeatCount="indefinite" />
            </polygon>
          </g>
        </g>
      );
      
    case 'hospital':
      return (
        <g>
          {/* Shadow */}
          <ellipse cx={s/2} cy={s*0.92} rx={s*0.38} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
          {/* Main building */}
          <rect x={s*0.12} y={s*0.3} width={s*0.76} height={s*0.6} fill={COLORS.hospital} rx={3} />
          <rect x={s*0.12} y={s*0.3} width={s*0.12} height={s*0.6} fill={COLORS.hospitalRoof} rx={3} />
          {/* Roof */}
          <rect x={s*0.08} y={s*0.25} width={s*0.84} height={s*0.08} fill={COLORS.hospitalRoof} rx={2} />
          {/* Red cross with subtle pulse */}
          <g>
            <rect x={s*0.42} y={s*0.38} width={s*0.16} height={s*0.4} fill={COLORS.hospitalCross} rx={2}>
              <animate attributeName="opacity" values="1;0.85;1" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x={s*0.3} y={s*0.5} width={s*0.4} height={s*0.16} fill={COLORS.hospitalCross} rx={2}>
              <animate attributeName="opacity" values="1;0.85;1" dur="2s" repeatCount="indefinite" />
            </rect>
          </g>
          {/* Door */}
          <rect x={s*0.42} y={s*0.72} width={s*0.16} height={s*0.18} fill={COLORS.hospitalRoof} rx={2} />
          {/* Windows */}
          <rect x={s*0.18} y={s*0.45} width={s*0.1} height={s*0.12} fill={COLORS.houseWindow} rx={1} />
          <rect x={s*0.72} y={s*0.45} width={s*0.1} height={s*0.12} fill={COLORS.houseWindow} rx={1} />
          {/* Ambulance cross on side */}
          <circle cx={s*0.22} cy={s*0.75} r={s*0.06} fill={COLORS.hospitalCross} opacity={0.3}>
            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      );
      
    case 'school':
      return (
        <g>
          {/* Shadow */}
          <ellipse cx={s/2} cy={s*0.92} rx={s*0.38} ry={s*0.06} fill="rgba(0,0,0,0.2)" />
          {/* Main building */}
          <rect x={s*0.1} y={s*0.4} width={s*0.8} height={s*0.5} fill={COLORS.school} rx={3} />
          <rect x={s*0.1} y={s*0.4} width={s*0.12} height={s*0.5} fill={COLORS.schoolDark} rx={3} />
          {/* Bell tower */}
          <rect x={s*0.38} y={s*0.12} width={s*0.24} height={s*0.32} fill={COLORS.school} rx={2} />
          <rect x={s*0.38} y={s*0.12} width={s*0.06} height={s*0.32} fill={COLORS.schoolDark} rx={2} />
          {/* Bell dome */}
          <ellipse cx={s*0.5} cy={s*0.12} rx={s*0.14} ry={s*0.06} fill={COLORS.schoolDark} />
          {/* Swinging bell */}
          <g transform={`translate(${s*0.5}, ${s*0.16})`}>
            <animateTransform attributeName="transform" type="rotate" values="-8;8;-8" dur="1.5s" repeatCount="indefinite" additive="sum" />
            <circle cx={0} cy={s*0.06} r={s*0.06} fill={COLORS.schoolBell} />
            <rect x={-s*0.02} y={-s*0.04} width={s*0.04} height={s*0.08} fill={COLORS.schoolBell} />
          </g>
          {/* Clock */}
          <circle cx={s*0.5} cy={s*0.32} r={s*0.05} fill="white" />
          {/* Clock hands - minute hand rotates */}
          <line x1={s*0.5} y1={s*0.32} x2={s*0.5} y2={s*0.28} stroke={COLORS.schoolDark} strokeWidth={1} />
          <g transform={`translate(${s*0.5}, ${s*0.32})`}>
            <line x1={0} y1={0} x2={s*0.03} y2={0} stroke={COLORS.schoolDark} strokeWidth={1}>
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite" />
            </line>
          </g>
          {/* Door */}
          <rect x={s*0.42} y={s*0.65} width={s*0.16} height={s*0.25} fill={COLORS.schoolDark} rx={2} />
          {/* Windows */}
          <rect x={s*0.15} y={s*0.5} width={s*0.1} height={s*0.12} fill={COLORS.schoolWindow} rx={1} />
          <rect x={s*0.28} y={s*0.5} width={s*0.1} height={s*0.12} fill={COLORS.schoolWindow} rx={1} />
          <rect x={s*0.62} y={s*0.5} width={s*0.1} height={s*0.12} fill={COLORS.schoolWindow} rx={1} />
          <rect x={s*0.75} y={s*0.5} width={s*0.1} height={s*0.12} fill={COLORS.schoolWindow} rx={1} />
        </g>
      );
      
    case 'dock':
      return (
        <g>
          {/* Water underneath */}
          <rect x={s*0.05} y={s*0.6} width={s*0.9} height={s*0.35} fill={COLORS.waterMid} rx={2} />
          {/* Wooden planks */}
          <rect x={s*0.1} y={s*0.2} width={s*0.8} height={s*0.45} fill={COLORS.dock} rx={2} />
          {/* Plank lines */}
          {[0.28, 0.36, 0.44, 0.52, 0.6].map((y, i) => (
            <line key={i} x1={s*0.1} y1={s*y} x2={s*0.9} y2={s*y} stroke={COLORS.fortDark} strokeWidth={1} />
          ))}
          {/* Support posts */}
          <rect x={s*0.15} y={s*0.55} width={s*0.08} height={s*0.35} fill={COLORS.fortDark} />
          <rect x={s*0.77} y={s*0.55} width={s*0.08} height={s*0.35} fill={COLORS.fortDark} />
          {/* Rope coil */}
          <ellipse cx={s*0.75} cy={s*0.35} rx={s*0.08} ry={s*0.06} fill={COLORS.house} />
          <ellipse cx={s*0.75} cy={s*0.35} rx={s*0.04} ry={s*0.03} fill={COLORS.dock} />
          {/* Mooring post */}
          <rect x={s*0.22} y={s*0.25} width={s*0.06} height={s*0.15} fill={COLORS.fortDark} />
          <ellipse cx={s*0.25} cy={s*0.25} rx={s*0.05} ry={s*0.02} fill={COLORS.fortDark} />
        </g>
      );
      
    default:
      return null;
  }
};

// Detailed boat component
const Boat = ({ x, y, type, selected }) => {
  const size = 42;
  const color = type === 'fishing' ? COLORS.fishingBoat : COLORS.ptBoat;
  const darkColor = type === 'fishing' ? COLORS.fishingBoatDark : COLORS.ptBoatDark;
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      {selected && (
        <rect x={-4} y={-4} width={size + 8} height={size + 8} 
              fill="none" stroke={COLORS.selected} strokeWidth={3} rx={6} />
      )}
      {/* Boat shadow on water */}
      <ellipse cx={size/2} cy={size*0.85} rx={18} ry={5} fill="rgba(0,0,0,0.2)" />
      {/* Hull */}
      <ellipse cx={size/2} cy={size*0.65} rx={18} ry={10} fill={color} />
      <ellipse cx={size/2 - 4} cy={size*0.65} rx={14} ry={8} fill={darkColor} />
      {/* Deck */}
      <ellipse cx={size/2} cy={size*0.55} rx={14} ry={6} fill={color} />
      {type === 'fishing' ? (
        <>
          {/* Fishing mast */}
          <rect x={size/2 - 2} y={size*0.15} width={4} height={size*0.4} fill={COLORS.fortDark} />
          {/* Sail */}
          <polygon 
            points={`${size/2 + 2},${size*0.18} ${size/2 + 2},${size*0.5} ${size*0.8},${size*0.45}`}
            fill="white" opacity={0.9}
          />
          {/* Net */}
          <path d={`M ${size*0.2} ${size*0.4} Q ${size*0.1} ${size*0.6} ${size*0.25} ${size*0.7}`} 
                stroke={COLORS.fortDark} strokeWidth={1} fill="none" />
        </>
      ) : (
        <>
          {/* PT boat cabin */}
          <rect x={size*0.3} y={size*0.3} width={size*0.4} height={size*0.25} fill={COLORS.ptBoatDark} rx={3} />
          {/* Gun turret */}
          <circle cx={size*0.7} cy={size*0.4} r={6} fill={COLORS.ptBoatGun} />
          <rect x={size*0.68} y={size*0.2} width={4} height={12} fill={COLORS.ptBoatGun} />
          {/* Antenna */}
          <rect x={size*0.35} y={size*0.1} width={2} height={size*0.2} fill={COLORS.ptBoatGun} />
        </>
      )}
    </g>
  );
};

// Fish school animation
const FishSchool = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    {[
      { dx: 0, dy: 0, size: 8, dur: 3 },
      { dx: 15, dy: 8, size: 6, dur: 2.5 },
      { dx: -8, dy: 12, size: 7, dur: 3.5 },
      { dx: 20, dy: -5, size: 5, dur: 2.8 },
      { dx: 5, dy: 18, size: 6, dur: 3.2 },
    ].map((fish, i) => (
      <g key={i}>
        <animateTransform 
          attributeName="transform" 
          type="translate" 
          values={`${fish.dx},${fish.dy}; ${fish.dx + 8},${fish.dy - 3}; ${fish.dx},${fish.dy}`}
          dur={`${fish.dur}s`}
          repeatCount="indefinite"
        />
        <ellipse cx={0} cy={0} rx={fish.size} ry={fish.size*0.5} fill={COLORS.waterHighlight} opacity={0.7} />
        <polygon points={`${fish.size},0 ${fish.size+4},-3 ${fish.size+4},3`} fill={COLORS.waterHighlight} opacity={0.7} />
      </g>
    ))}
  </g>
);

// Rain cloud with detail
const RainCloud = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Cloud body */}
    <ellipse cx={25} cy={15} rx={22} ry={14} fill="#b8c5d0" />
    <ellipse cx={45} cy={18} rx={16} ry={12} fill="#c8d4de" />
    <ellipse cx={10} cy={20} rx={14} ry={10} fill="#b8c5d0" />
    <ellipse cx={30} cy={22} rx={18} ry={10} fill="#d0dae2" />
    {/* Rain drops */}
    {[12, 24, 36, 48].map((rx, i) => (
      <g key={i}>
        <line x1={rx} y1={32} x2={rx - 3} y2={45} stroke={COLORS.rain} strokeWidth={2} strokeLinecap="round" />
        <line x1={rx + 6} y1={38} x2={rx + 3} y2={50} stroke={COLORS.rain} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      </g>
    ))}
  </g>
);

// Status bar
const StatusBar = () => (
  <g>
    <rect x={0} y={0} width={CANVAS_WIDTH} height={56} fill={COLORS.panel} />
    <rect x={0} y={54} width={CANVAS_WIDTH} height={2} fill={COLORS.panelBorder} />
    
    {/* Gold */}
    <circle cx={24} cy={28} r={14} fill={COLORS.gold} />
    <text x={22} y={33} fill={COLORS.panel} fontSize={12} fontWeight="bold" textAnchor="middle">$</text>
    <text x={50} y={34} fill={COLORS.text} fontSize={18} fontWeight="bold" fontFamily="system-ui">247</text>
    
    {/* Population */}
    <text x={110} y={18} fill={COLORS.textDim} fontSize={10} fontFamily="system-ui">POPULATION</text>
    <text x={110} y={38} fill={COLORS.text} fontSize={16} fontWeight="bold" fontFamily="system-ui">1,842</text>
    
    {/* Score */}
    <text x={200} y={18} fill={COLORS.textDim} fontSize={10} fontFamily="system-ui">SCORE</text>
    <text x={200} y={38} fill={COLORS.text} fontSize={16} fontWeight="bold" fontFamily="system-ui">73</text>
    
    {/* Round */}
    <text x={265} y={18} fill={COLORS.textDim} fontSize={10} fontFamily="system-ui">ROUND</text>
    <text x={265} y={38} fill={COLORS.text} fontSize={16} fontWeight="bold" fontFamily="system-ui">5 / 15</text>
    
    {/* Timer */}
    <text x={355} y={36} fill={COLORS.selected} fontSize={22} fontWeight="bold" fontFamily="system-ui" textAnchor="end">0:47</text>
  </g>
);

// Minimap
const Minimap = ({ fogOfWar }) => (
  <g transform="translate(295, 68)">
    <rect x={0} y={0} width={85} height={75} fill={COLORS.waterDeep} rx={6} stroke={COLORS.panelBorder} strokeWidth={2} />
    
    {/* Mini island */}
    <g transform="translate(8, 8) scale(0.19)">
      {ISLAND_TILES.map((tile, i) => (
        <rect
          key={i}
          x={tile.x * TILE_SIZE}
          y={tile.y * TILE_SIZE}
          width={TILE_SIZE - 4}
          height={TILE_SIZE - 4}
          fill={fogOfWar ? COLORS.fog : COLORS.landDark}
          rx={4}
        />
      ))}
    </g>
    
    <text x={42} y={68} fill={COLORS.textDim} fontSize={9} textAnchor="middle" fontFamily="system-ui">
      OPPONENT
    </text>
  </g>
);

// Build menu
const BuildMenu = ({ x, y }) => {
  const items = [
    { type: 'house', cost: 28, label: 'House' },
    { type: 'farm', cost: 3, label: 'Crops' },
    { type: 'factory', cost: 40, label: 'Factory' },
    { type: 'school', cost: 35, label: 'School' },
    { type: 'hospital', cost: 75, label: 'Hospital' },
    { type: 'fort', cost: 50, label: 'Fort' },
  ];
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={0} y={0} width={130} height={195} fill={COLORS.panel} rx={8} stroke={COLORS.panelBorder} strokeWidth={2} />
      
      <text x={65} y={20} fill={COLORS.text} fontSize={13} fontWeight="bold" textAnchor="middle" fontFamily="system-ui">
        BUILD
      </text>
      
      {items.map((item, i) => (
        <g key={item.type} transform={`translate(6, ${28 + i * 27})`} style={{ cursor: 'pointer' }}>
          <rect x={0} y={0} width={118} height={24} fill={COLORS.panelLight} rx={4} />
          <svg x={2} y={-6} width={32} height={32} viewBox="0 0 40 40">
            <BuildingIcon type={item.type} size={40} />
          </svg>
          <text x={40} y={16} fill={COLORS.text} fontSize={11} fontFamily="system-ui">{item.label}</text>
          <text x={112} y={16} fill={COLORS.gold} fontSize={11} fontWeight="bold" textAnchor="end" fontFamily="system-ui">
            {item.cost}g
          </text>
        </g>
      ))}
    </g>
  );
};

// Main component
export default function EutopiaPrototypeV3() {
  const [showBuildMenu, setShowBuildMenu] = useState(true);
  const [selectedTile, setSelectedTile] = useState({ x: 5, y: 3 });
  const [fogOfWar, setFogOfWar] = useState(false);
  
  const buildingMap = new Map(BUILDINGS.map(b => [`${b.x},${b.y}`, b.type]));
  
  return (
    <div style={{
      backgroundColor: '#0a1520',
      padding: 12,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Title */}
      <h1 style={{
        color: COLORS.gold,
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 6,
        margin: '8px 0 12px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        EUTOPÍA
      </h1>
      
      {/* Mode toggles */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'ORIGINAL', active: !fogOfWar, onClick: () => setFogOfWar(false) },
          { label: 'ENHANCED', active: fogOfWar, onClick: () => setFogOfWar(true) },
          { label: showBuildMenu ? 'HIDE MENU' : 'SHOW MENU', active: false, onClick: () => setShowBuildMenu(!showBuildMenu) },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            style={{
              padding: '8px 14px',
              backgroundColor: btn.active ? COLORS.selected : COLORS.panelLight,
              color: btn.active ? 'white' : COLORS.text,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'system-ui'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
      
      {/* Game canvas - iPhone sized */}
      <svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        {/* Status bar */}
        <StatusBar />
        
        {/* Water */}
        <rect x={0} y={56} width={CANVAS_WIDTH} height={CANVAS_HEIGHT - 56} fill={COLORS.waterDeep} />
        
        {/* Water waves */}
        {[...Array(15)].map((_, i) => (
          <rect key={i} x={0} y={70 + i * 30} width={CANVAS_WIDTH} height={2} fill={COLORS.waterMid} opacity={0.3} />
        ))}
        
        {/* Fish */}
        <FishSchool x={15} y={280} />
        
        {/* Island */}
        {ISLAND_TILES.map((tile, i) => {
          const tx = GRID_OFFSET_X + tile.x * TILE_SIZE;
          const ty = GRID_OFFSET_Y + tile.y * TILE_SIZE;
          const isSelected = tile.x === selectedTile.x && tile.y === selectedTile.y;
          const building = buildingMap.get(`${tile.x},${tile.y}`);
          
          return (
            <g key={i}>
              {/* Tile shadow */}
              <rect x={tx + 2} y={ty + 2} width={TILE_SIZE - 2} height={TILE_SIZE - 2}
                    fill="rgba(0,0,0,0.25)" rx={6} />
              {/* Land tile */}
              <rect
                x={tx} y={ty}
                width={TILE_SIZE - 2} height={TILE_SIZE - 2}
                fill={COLORS.land}
                stroke={isSelected ? COLORS.selected : COLORS.landDark}
                strokeWidth={isSelected ? 3 : 1}
                rx={6}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedTile({ x: tile.x, y: tile.y })}
              />
              {/* Building */}
              {building && (
                <svg x={tx + 3} y={ty + 3} width={TILE_SIZE - 8} height={TILE_SIZE - 8} viewBox="0 0 40 40">
                  <BuildingIcon type={building} size={40} />
                </svg>
              )}
            </g>
          );
        })}
        
        {/* Rain */}
        <RainCloud x={100} y={120} />
        
        {/* Boats */}
        {BOATS.map((boat, i) => (
          <Boat
            key={i}
            x={GRID_OFFSET_X + boat.x * TILE_SIZE}
            y={GRID_OFFSET_Y + boat.y * TILE_SIZE}
            type={boat.type}
            selected={boat.selected}
          />
        ))}
        
        {/* Minimap */}
        <Minimap fogOfWar={fogOfWar} />
        
        {/* Build menu */}
        {showBuildMenu && (
          <BuildMenu
            x={Math.min(GRID_OFFSET_X + selectedTile.x * TILE_SIZE + TILE_SIZE + 5, CANVAS_WIDTH - 140)}
            y={Math.min(GRID_OFFSET_Y + selectedTile.y * TILE_SIZE, CANVAS_HEIGHT - 210)}
          />
        )}
        
        {/* Help text */}
        <text x={CANVAS_WIDTH / 2} y={CANVAS_HEIGHT - 12} fill={COLORS.textDim} fontSize={10} textAnchor="middle">
          Tap tile to select • Tap boat then destination to move
        </text>
      </svg>
      
      {/* Device info */}
      <div style={{ color: COLORS.textDim, fontSize: 10, marginTop: 12 }}>
        Preview at 390×520 (iPhone 14 / 15 width)
      </div>
    </div>
  );
}
