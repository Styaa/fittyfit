// Jembatan JS untuk modul native Shadow Fit Lockdown (Android).
// Di web / iOS / Expo Go modul ini tidak ada → semua fungsi aman (no-op).
import { requireOptionalNativeModule } from 'expo';

interface ShadowLockNative {
  isServiceEnabled(): boolean;
  openAccessibilitySettings(): void;
  openAppDetails(): void;
  setConfig(enabled: boolean, hour: number, minute: number, days: number[], unlocked: string[]): void;
  startTest(seconds: number): void;
  stopTest(): void;
  isLockedNow(): boolean;
  openApp(kind: AllowedApp): boolean;
}

export type AllowedApp = 'dialer' | 'sms' | 'alarm' | 'maps' | 'settings';

const Native = requireOptionalNativeModule<ShadowLockNative>('ShadowLock');

/** true hanya di APK Android yang menyertakan modul native */
export const lockSupported = !!Native;

const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const isServiceEnabled = () => safe(() => Native?.isServiceEnabled() ?? false, false);
export const openAccessibilitySettings = () => safe(() => Native?.openAccessibilitySettings(), undefined);
export const openAppDetails = () => safe(() => Native?.openAppDetails(), undefined);
export const setLockConfig = (cfg: { enabled: boolean; hour: number; minute: number; days: number[]; unlocked: string[] }) =>
  safe(() => Native?.setConfig(cfg.enabled, cfg.hour, cfg.minute, cfg.days, cfg.unlocked), undefined);
export const startLockTest = (seconds: number) => safe(() => Native?.startTest(seconds), undefined);
export const stopLockTest = () => safe(() => Native?.stopTest(), undefined);
export const nativeLockedNow = () => safe(() => Native?.isLockedNow() ?? false, false);
export const openAllowedApp = (kind: AllowedApp) => safe(() => Native?.openApp(kind) ?? false, false);
