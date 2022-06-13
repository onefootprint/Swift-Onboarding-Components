import { Event } from '../iframe-manager';

export enum Appearance {
  dark = 'dark',
  light = 'light',
  auto = 'auto',
}

export type OpenOptions = {
  appearance?: Appearance;
  locale?: 'EN';
  tracking?: Record<string, string | number | boolean>;
};

export type UIManager = {
  close(option?: OpenOptions): void;
  createContainer(): HTMLElement;
  hideOverlay(): void;
  on(eventName: Event, callback: () => void): void;
  show(option?: OpenOptions): Promise<void>;
  showOverlay(container: HTMLElement): void;
};
