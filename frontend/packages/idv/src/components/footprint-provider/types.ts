import type { FootprintPrivateEvent } from '@onefootprint/footprint-js';

export type CompletePayload = { validationToken: string; closeDelay?: number };

export type CustomChildAPI = Postmate.ChildAPI & {
  child?: Record<string, unknown>; // Window type; child === window
  parent?: Record<string, unknown>; // Window type
  parentOrigin?: string;
  model?: {
    sdkUrl?: string;
    sdkVersion?: string;
  };
};

export type IframeAdapterReturn = {
  cancel: () => void;
  close: () => void;
  complete: (completePayload: CompletePayload) => void;
  getAdapterResponse: () => CustomChildAPI | null;
  getLoadingStatus: () => boolean;
  load: () => Promise<CustomChildAPI | null>;
  on: (name: string, cb: Function) => () => void;
};

export type EmptyAdapterReturn = {
  cancel: () => void;
  close: () => void;
  complete: () => void;
  load: () => Promise<void>;
  on: () => () => void;
};

export type WebViewAdapterReturn = {
  cancel: () => void;
  close: () => void;
  complete: ({ validationToken }: CompletePayload) => void;
  load: () => Promise<void>;
  on: () => () => void;
};

export type ProviderReturn = {
  cancel: () => void;
  close: () => void;
  complete: (completePayload: CompletePayload) => void;
  getAdapterResponse?: () => CustomChildAPI | null;
  getLoadingStatus?: () => boolean;
  load: (() => Promise<void>) | (() => Promise<CustomChildAPI | null>);
  on:
    | ((name: FootprintPrivateEvent, cb: Function) => () => void)
    | (() => () => void);
};
