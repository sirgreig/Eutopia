// src/services/adService.ts
// Ad service for Eutopia - handles interstitial ads between rounds
// Gracefully skips ads in Expo Go, shows real ads in TestFlight/production

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go (no native ad support)
const isExpoGo = Constants.appOwnership === 'expo';

// MASTER SWITCH — set to true to serve ads.
//
// The react-native-google-mobile-ads native module ships in the binary, so ads can
// be enabled or disabled over the air without a new build. When false the SDK is
// never initialised at all.
const ADS_ENABLED = true;

// Ad Unit IDs.
//
// __DEV__ builds use Google's official test units, which always fill — useful for
// verifying the integration works before a real unit has warmed up. Production uses
// the live units from the AdMob console.
//
// NOTE: only the iOS interstitial unit exists so far. Android falls back to the test
// unit rather than a placeholder, so an Android build cannot accidentally request an
// invalid unit id (which produces confusing "no fill" errors). Create the Android
// unit in AdMob before releasing on Play.
const AD_UNIT_IDS = {
  ios: {
    interstitial: __DEV__
      ? 'ca-app-pub-3940256099942544/4411468910'  // Google test ad unit
      : 'ca-app-pub-7909587764339962/5762878359', // Eutopia Round Interstitial (iOS)
  },
  android: {
    interstitial: 'ca-app-pub-3940256099942544/1033173712', // Google test unit — no live Android unit yet
  },
};

// Types
type AdLoadCallback = () => void;
type AdErrorCallback = (error: Error) => void;

interface AdServiceState {
  isLoaded: boolean;
  isLoading: boolean;
  interstitial: any | null;
}

// Service state
const state: AdServiceState = {
  isLoaded: false,
  isLoading: false,
  interstitial: null,
};

// Callbacks
let onAdLoaded: AdLoadCallback | null = null;
let onAdError: AdErrorCallback | null = null;
let onAdClosed: AdLoadCallback | null = null;

/**
 * Initialize the ad service
 * Call this once when the app starts
 */
export const initializeAds = async (): Promise<void> => {
  if (!ADS_ENABLED) {
    console.log('[AdService] Ads disabled for this release');
    return;
  }

  if (isExpoGo) {
    console.log('[AdService] Running in Expo Go - ads disabled');
    return;
  }

  try {
    // Dynamically import to avoid crashes in Expo Go
    const { InterstitialAd, AdEventType, TestIds } = await import('react-native-google-mobile-ads');
    
    const adUnitId = Platform.OS === 'ios' 
      ? AD_UNIT_IDS.ios.interstitial 
      : AD_UNIT_IDS.android.interstitial;

    state.interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Set up event listeners
    state.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdService] Interstitial ad loaded');
      state.isLoaded = true;
      state.isLoading = false;
      onAdLoaded?.();
    });

    state.interstitial.addAdEventListener(AdEventType.ERROR, (error: Error) => {
      console.log('[AdService] Interstitial ad error:', error);
      state.isLoaded = false;
      state.isLoading = false;
      onAdError?.(error);
    });

    state.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdService] Interstitial ad closed');
      state.isLoaded = false;
      onAdClosed?.();
      // Pre-load the next ad
      loadInterstitial();
    });

    // Load the first ad
    loadInterstitial();
    
    console.log('[AdService] Initialized successfully');
  } catch (error) {
    console.log('[AdService] Failed to initialize:', error);
  }
};

/**
 * Load an interstitial ad
 * Call this to pre-load an ad before you need to show it
 */
export const loadInterstitial = (): void => {
  if (!ADS_ENABLED) return;
  if (isExpoGo) {
    console.log('[AdService] Expo Go - skipping ad load');
    return;
  }

  if (state.isLoading || state.isLoaded) {
    console.log('[AdService] Ad already loading or loaded');
    return;
  }

  if (!state.interstitial) {
    console.log('[AdService] Interstitial not initialized');
    return;
  }

  try {
    state.isLoading = true;
    state.interstitial.load();
    console.log('[AdService] Loading interstitial ad...');
  } catch (error) {
    console.log('[AdService] Error loading ad:', error);
    state.isLoading = false;
  }
};

/**
 * Show an interstitial ad
 * Returns a promise that resolves when the ad is closed (or immediately if no ad available)
 */
export const showInterstitial = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!ADS_ENABLED) {
      resolve(false);
      return;
    }

    if (isExpoGo) {
      console.log('[AdService] Expo Go - skipping ad show');
      resolve(false);
      return;
    }

    if (!state.isLoaded || !state.interstitial) {
      console.log('[AdService] No ad loaded to show');
      resolve(false);
      return;
    }

    // Set up one-time close handler
    const previousOnClosed = onAdClosed;
    onAdClosed = () => {
      onAdClosed = previousOnClosed;
      resolve(true);
    };

    try {
      state.interstitial.show();
      console.log('[AdService] Showing interstitial ad');
    } catch (error) {
      console.log('[AdService] Error showing ad:', error);
      onAdClosed = previousOnClosed;
      resolve(false);
    }
  });
};

/**
 * Check if an ad is ready to show
 */
export const isAdReady = (): boolean => {
  if (!ADS_ENABLED) return false;
  if (isExpoGo) return false;
  return state.isLoaded;
};

/**
 * Check if ads are supported in this environment
 */
export const isAdsSupported = (): boolean => {
  return ADS_ENABLED && !isExpoGo;
};

/**
 * Set callback for when ad loads
 */
export const setOnAdLoaded = (callback: AdLoadCallback | null): void => {
  onAdLoaded = callback;
};

/**
 * Set callback for ad errors
 */
export const setOnAdError = (callback: AdErrorCallback | null): void => {
  onAdError = callback;
};

// Export a convenient object for the service
export const AdService = {
  initialize: initializeAds,
  loadInterstitial,
  showInterstitial,
  isAdReady,
  isAdsSupported,
  setOnAdLoaded,
  setOnAdError,
};

export default AdService;
