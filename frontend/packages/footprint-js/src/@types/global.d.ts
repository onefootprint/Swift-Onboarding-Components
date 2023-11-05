import type { Appearance } from '../types/appearance';

declare interface Window {
  footprintAppearance?: Appearance;
  footprintCallbacks?: { [key: string]: () => unknown };
}
