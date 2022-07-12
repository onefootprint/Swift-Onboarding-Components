export type Flow = 'authentication' | 'onboarding';

export type InitOptions = {
  publicKey?: string;
  flow?: Flow;
};

export type Footprint = {
  init(options: InitOptions): Footprint;
  show(options?: OpenOptions): void;
  createButton(container: HTMLElement): HTMLButtonElement;
  onAuthenticated(callback: (vtok: string) => void): void;
  onCompleted(callback: (footprintUserId: string) => void): void;
  onFailed(callback: () => void): void;
  onUserCanceled(callback: () => void): void;
};

export enum Appearance {
  dark = 'dark',
  light = 'light',
  auto = 'auto',
}

export type OpenOptions = {
  appearance?: Appearance;
  locale?: 'EN';
  tracking?: Record<string, string | number | boolean>;
  url: string;
};

export type UIManager = {
  createButton(container: HTMLElement): HTMLButtonElement;
  on(eventName: FootprintEvent, callback: (data?: any) => void): void;
  show(option?: OpenOptions): Promise<void>;
  hide(option?: OpenOptions): void;
};

export enum FootprintEvents {
  authenticated = 'authenticated',
  closed = 'closed',
  completed = 'completed',
  failed = 'failed',
  userCanceled = 'userCanceled',
}

export type FootprintEvent = FootprintEvents;
