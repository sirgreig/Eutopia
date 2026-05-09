// src/config/firebaseConfig.ts
// Firebase initialisation for Eutopia multiplayer
// Uses the JS SDK (firebase npm package) — works in Expo Go without a native build
// Note: getAnalytics is intentionally omitted — it doesn't work in React Native

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAvBWTdRWzTGW3OjyIN896gpDgT-WmEzb4",
  authDomain: "eutopia-2f19f.firebaseapp.com",
  databaseURL: "https://eutopia-2f19f-default-rtdb.firebaseio.com",
  projectId: "eutopia-2f19f",
  storageBucket: "eutopia-2f19f.firebasestorage.app",
  messagingSenderId: "474267177782",
  appId: "1:474267177782:web:6c389c02896f8ea58bd997",
};

// Guard against re-initialisation on Expo hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getDatabase(app);
export default app;
