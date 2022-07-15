export type Flow = 'authentication' | 'onboarding';

export type Footprint = {
  init(options?: { publicKey?: string }): void;
  show(callback?: {
    onAuthenticated?: (vtok: string) => void;
    onCompleted?: (footprintUserId: string) => void;
    onUserCanceled?: () => void;
  }): Promise<void>;
  createButton(container: HTMLElement): HTMLButtonElement;
};

export enum FootprintEvents {
  authenticated = 'authenticated',
  closed = 'closed',
  completed = 'completed',
  userCanceled = 'userCanceled',
}

export type FootprintEvent = FootprintEvents;

export type OpenOptions = {
  url: string;
};

export type UIManager = {
  createButton(container: HTMLElement): HTMLButtonElement;
  on(eventName: FootprintEvent, callback: (data?: any) => void): void;
  show(option?: OpenOptions): Promise<void>;
  hide(option?: OpenOptions): void;
};
