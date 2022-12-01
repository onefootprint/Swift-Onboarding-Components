export type CompletePayload = {
  validationToken: string;
  closeDelay?: number;
};

export interface FootprintClient {
  cancel(): void;
  close(): void;
  complete(payload: CompletePayload): void;
}
