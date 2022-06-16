import { OpenOptions } from '../ui';

export type InitOptions = {
  publicKey: string;
};

export type Footprint = {
  init(options: InitOptions): Footprint;
  show(options?: OpenOptions): void;
  createButton(target: HTMLElement): HTMLButtonElement;
  onCompleted(callback: () => void): void;
  onFailed(callback: () => void): void;
  onUserCanceled(callback: () => void): void;
};
