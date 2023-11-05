export type FootprintClient = {
  load: () => Promise<void>;
  send: (name: string, data?: unknown) => void;
  // Returns unsubscribe callback
  on: (name: string, callback: (data?: unknown) => void) => () => void;
};
