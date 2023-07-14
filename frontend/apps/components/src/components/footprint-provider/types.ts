export type FootprintClient = {
  load: () => Promise<void>;
  send: (name: string, data?: any) => void;
  // Returns unsubscribe callback
  on: (name: string, callback: (data?: any) => void) => () => void;
};
