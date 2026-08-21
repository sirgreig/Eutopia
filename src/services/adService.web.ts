// src/services/adService.web.ts
//
// Web stub for the ad service.
//
// Metro resolves platform-specific extensions automatically: this file is used for
// web, and adService.ts is used for iOS and Android. Nothing imports it directly.
//
// WHY THIS EXISTS
// react-native-google-mobile-ads reaches into React Native internals
// (codegenNativeComponent) that do not exist on web. Metro resolves the dynamic
// `await import(...)` in adService.ts at BUILD time, not runtime, so the runtime
// `isExpoGo` / ADS_ENABLED guards don't prevent it being bundled — the web build
// fails outright, which breaks both `expo start --web` and `eas update` for all
// platforms.
//
// Web is not a release target for Eutopia; it exists as a convenient second client
// for multiplayer testing. Ads there would be meaningless anyway.

type AdLoadCallback = () => void;
type AdErrorCallback = (error: Error) => void;

export const initializeAds = async (): Promise<void> => {
  // No ads on web.
};

export const loadInterstitial = (): void => {
  // No-op.
};

export const showInterstitial = (): Promise<boolean> => Promise.resolve(false);

export const isAdReady = (): boolean => false;

export const isAdsSupported = (): boolean => false;

export const setOnAdLoaded = (_callback: AdLoadCallback | null): void => {
  // No-op.
};

export const setOnAdError = (_callback: AdErrorCallback | null): void => {
  // No-op.
};

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
