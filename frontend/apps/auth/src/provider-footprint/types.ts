import type { FootprintPublicEvent } from '@onefootprint/footprint-js';
import type { CustomChildAPI } from '@onefootprint/idv';

export type EmptyAdapterReturn = {
  getAdapterKind: () => 'empty';
  getAdapterResponse: () => null;
  getLoadingStatus: () => false;
  load: () => Promise<void>;
  on: () => () => void;
  send: (event: `${FootprintPublicEvent}`, data?: unknown) => void;
};

export type WebViewAdapterReturn = {
  getAdapterKind: () => 'webview';
  getAdapterResponse: () => null;
  getLoadingStatus: () => boolean;
  load: () => Promise<void>;
  on: () => () => void;
  send: (event: `${FootprintPublicEvent}`, data?: unknown) => void;
};

export type IframeAdapterReturn = {
  getAdapterKind: () => 'iframe';
  getAdapterResponse: () => CustomChildAPI | null;
  getLoadingStatus: () => boolean;
  load: () => Promise<CustomChildAPI | null>;
  on: (event: string, callback: Function) => () => void;
  send: (event: `${FootprintPublicEvent}`, data?: unknown) => void;
};

export type ProviderReturn = {
  getAdapterKind: () => 'iframe' | 'webview' | 'empty';
  getAdapterResponse: (() => CustomChildAPI | null) | (() => null);
  getLoadingStatus: () => boolean;
  load: (() => Promise<CustomChildAPI | null>) | (() => Promise<void>);
  on: ((event: string, callback: Function) => () => void) | (() => () => void);
  send: (event: `${FootprintPublicEvent}`, data?: unknown) => void;
};
