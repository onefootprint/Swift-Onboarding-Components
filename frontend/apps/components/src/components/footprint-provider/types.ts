export type CustomChildAPI = Postmate.ChildAPI & {
  child?: Record<string, unknown>; // Window type; child === window
  parent?: Record<string, unknown>; // Window type
  parentOrigin?: string;
  model?: {
    sdkUrl?: string;
    sdkVersion?: string;
  };
};

export type WebViewAdapterReturn = {
  getAdapterResponse: () => null;
  getLoadingStatus: () => boolean;
  load: () => Promise<void>;
  on: () => () => void;
  send: (event: string) => void;
};

export type IframeAdapterReturn = {
  getAdapterResponse: () => CustomChildAPI | null;
  getLoadingStatus: () => boolean;
  load: () => Promise<CustomChildAPI | null>;
  on: (event: string, callback: Function) => () => void;
  send: (event: string, data?: unknown) => void;
};

export type ProviderReturn = {
  getAdapterResponse: (() => CustomChildAPI | null) | (() => null);
  getLoadingStatus: () => boolean;
  load: (() => Promise<CustomChildAPI | null>) | (() => Promise<void>);
  on: ((event: string, callback: Function) => () => void) | (() => () => void);
  send: ((event: string, data?: unknown) => void) | ((event: string) => void);
};
