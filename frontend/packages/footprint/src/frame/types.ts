export enum Appearance {
  dark = 'dark',
  light = 'light',
  auto = 'auto',
}

export type UserData = Record<string, string | number | boolean>;

export type OpenOptions = {
  appearance?: Appearance;
  locale?: 'EN';
  tracking?: Record<string, string | number | boolean>;
  userData?: UserData;
};

export type PrivateEvent = 'closed';

export type PublicEvent = 'completed' | 'failed' | 'userCanceled';

export type Event = PrivateEvent | PublicEvent;

export type RenderOptions = {
  container: HTMLElement;
  classList?: string[];
  urlHash: string;
};

export type FrameManager = {
  render(options: RenderOptions): void;
  destroy(): void;
  on(eventName: Event, callback: (data?: any) => void): void;
};
