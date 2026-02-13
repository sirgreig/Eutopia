// src/hooks/useAds.ts
// React hook for ad integration in game components

import { useEffect, useState, useCallback } from 'react';
import { AdService } from '../services/adService';

interface UseAdsReturn {
  /** Whether an ad is ready to be shown */
  isAdReady: boolean;
  /** Whether ads are supported in this environment */
  isSupported: boolean;
  /** Show an interstitial ad. Returns true if ad was shown, false otherwise */
  showAd: () => Promise<boolean>;
  /** Manually trigger loading a new ad */
  loadAd: () => void;
}

/**
 * Hook for managing ads in game components
 * 
 * Usage:
 * ```
 * const { isAdReady, showAd } = useAds();
 * 
 * const handleRoundEnd = async () => {
 *   // Show ad between rounds
 *   await showAd();
 *   // Continue to next round
 *   startNextRound();
 * };
 * ```
 */
export const useAds = (): UseAdsReturn => {
  const [isAdReady, setIsAdReady] = useState(false);
  const [isSupported] = useState(AdService.isAdsSupported());

  useEffect(() => {
    // Initialize ads when hook mounts
    AdService.initialize();

    // Set up listener for ad loaded state
    AdService.setOnAdLoaded(() => {
      setIsAdReady(true);
    });

    // Update ready state when ads fail or are shown
    const checkReadyInterval = setInterval(() => {
      setIsAdReady(AdService.isAdReady());
    }, 1000);

    return () => {
      clearInterval(checkReadyInterval);
      AdService.setOnAdLoaded(null);
    };
  }, []);

  const showAd = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('[useAds] Ads not supported in this environment');
      return false;
    }

    setIsAdReady(false);
    const shown = await AdService.showInterstitial();
    return shown;
  }, [isSupported]);

  const loadAd = useCallback((): void => {
    if (!isSupported) return;
    AdService.loadInterstitial();
  }, [isSupported]);

  return {
    isAdReady,
    isSupported,
    showAd,
    loadAd,
  };
};

export default useAds;
