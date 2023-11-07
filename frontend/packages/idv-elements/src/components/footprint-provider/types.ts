import type { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import type { IdvBootstrapData, IdvOptions } from '@onefootprint/types';

// TODO: (belce) delete after all customers are migrated to new footprint-js
// These events might be sent from older NPM version integrations to bifrost
export enum LegacyFootprintInternalEvent {
  started = 'started',
  bootstrapDataReceived = 'bootstrapDataReceived',
  optionsReceived = 'optionsReceived',
}

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
    name: LegacyFootprintInternalEvent | FootprintPrivateEvent,
    callback: ((data: IdvBootstrapData) => void) | ((data: IdvOptions) => void),
  ) => () => void;
};
