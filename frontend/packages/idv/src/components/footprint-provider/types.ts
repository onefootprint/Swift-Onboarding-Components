import type { FootprintPrivateEvent } from '@onefootprint/footprint-js';

export type CompletePayload = {
  validationToken: string;
  delay?: number;
  authToken?: string;
  deviceResponse?: string;
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
  auth: (token: string) => void;
  relayToComponents: (response: { authToken: string; vaultingToken: string }) => void;
  cancel: () => void;
  close: () => void;
  complete: (completePayload: CompletePayload) => void;
  getAdapterResponse: () => CustomChildAPI | null;
  getLoadingStatus: () => boolean;
  load: () => Promise<CustomChildAPI | null>;
  on: (name: FootprintPrivateEvent, cb: Function) => () => void;
};

export type EmptyAdapterReturn = {
  auth: () => void;
  relayToComponents: () => void;
  cancel: () => void;
  close: () => void;
  complete: () => void;
  load: () => Promise<void>;
  on: () => () => void;
};

export type SendResultCallback = (authToken: string, deviceResponse: string) => Promise<string | undefined>;

export type WebViewAdapterReturn = {
  auth: (token: string) => void;
  relayToComponents: (response: { authToken: string; vaultingToken: string }) => void;
  cancel: () => void;
  close: () => void;
  complete: (completePayload: CompletePayload) => void;
  load: () => Promise<void>;
  on: () => () => void;
  setSendResultCallback: (cb: SendResultCallback) => void;
};

export type ProviderReturn = {
  getAdapterResponse?: IframeAdapterReturn['getAdapterResponse'];
  getLoadingStatus?: IframeAdapterReturn['getLoadingStatus'];
  auth: EmptyAdapterReturn['auth'] | IframeAdapterReturn['auth'] | WebViewAdapterReturn['auth'];
  setSendResultCallback?: WebViewAdapterReturn['setSendResultCallback'];
  relayToComponents:
    | EmptyAdapterReturn['relayToComponents']
    | IframeAdapterReturn['relayToComponents']
    | WebViewAdapterReturn['relayToComponents'];
  cancel: EmptyAdapterReturn['cancel'] | IframeAdapterReturn['cancel'] | WebViewAdapterReturn['cancel'];
  close: EmptyAdapterReturn['close'] | IframeAdapterReturn['close'] | WebViewAdapterReturn['close'];
  complete: EmptyAdapterReturn['complete'] | IframeAdapterReturn['complete'] | WebViewAdapterReturn['complete'];
  load: EmptyAdapterReturn['load'] | IframeAdapterReturn['load'] | WebViewAdapterReturn['load'];
  on: EmptyAdapterReturn['on'] | IframeAdapterReturn['on'] | WebViewAdapterReturn['on'];
};
