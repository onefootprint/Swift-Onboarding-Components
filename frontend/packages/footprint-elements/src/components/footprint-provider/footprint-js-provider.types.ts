import { FootprintInternalEvent } from '@onefootprint/footprint-js';

export type CompletePayload = {
  validationToken: string;
  closeDelay?: number;
};

export type FootprintClient = {
  load(): void;
  cancel(): void;
  close(): void;
  complete(payload: CompletePayload): void;
  on(name: FootprintInternalEvent, callback: (data?: any) => void): () => void;
};

export { FootprintInternalEvent };
