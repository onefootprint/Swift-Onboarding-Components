import type { FootprintPrivateEvent } from '@onefootprint/footprint-js';

export type CompletePayload = {
  validationToken: string;
  delay?: number;
  authToken?: string;
  deviceResponseJson?: string;
};
export type CustomChildAPI = Postmate.ChildAPI & {
  child?: Record<string, unknown>; // Window type; child === window
  parent?: Record<string, unknown>; // Window type
  parentOrigin?: string;
  model?: {
    authToken?: string;
    initId?: string; // The initId is generated in the footprint-js application during iframe creation, it is the same id as the iframe.
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
  on: (name: FootprintPrivateEvent, cb: Function) => () => void;
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
  complete: (completePayload: CompletePayload) => void;
  load: () => Promise<void>;
  on: () => () => void;
};

export type ProviderReturn = {
  getAdapterResponse?: IframeAdapterReturn['getAdapterResponse'];
  getLoadingStatus?: IframeAdapterReturn['getLoadingStatus'];
  cancel:
    | EmptyAdapterReturn['cancel']
    | IframeAdapterReturn['cancel']
    | WebViewAdapterReturn['cancel'];
  close:
    | EmptyAdapterReturn['close']
    | IframeAdapterReturn['close']
    | WebViewAdapterReturn['close'];
  complete:
    | EmptyAdapterReturn['complete']
    | IframeAdapterReturn['complete']
    | WebViewAdapterReturn['complete'];
  load:
    | EmptyAdapterReturn['load']
    | IframeAdapterReturn['load']
    | WebViewAdapterReturn['load'];
  on:
    | EmptyAdapterReturn['on']
    | IframeAdapterReturn['on']
    | WebViewAdapterReturn['on'];
};
