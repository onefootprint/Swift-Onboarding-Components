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

export type IframeManager = {
  render(container: HTMLElement, iframeClassList?: string[]): void;
  destroy(): void;
  on(eventName: Event, callback: (data?: any) => void): void;
};
