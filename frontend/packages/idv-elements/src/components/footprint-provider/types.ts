import type { FootprintPrivateEvent } from '@onefootprint/footprint-js';

export type CompletePayload = {
  validationToken: string;
  closeDelay?: number;
};

export type FootprintClientGenerator = () => FootprintClient;

export type FootprintClient = {
  load: () => Promise<void>;
  cancel: () => void;
  close: () => void;
  complete: (payload: CompletePayload) => void;
  // Returns unsubscribe callback
  on: (
    name: FootprintPrivateEvent,
    callback: (props?: unknown) => void,
  ) => () => void;
};
