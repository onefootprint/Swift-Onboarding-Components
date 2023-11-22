export type MachineContext = {
  authToken: string;
};

export type MachineEvents = { type: 'failed' } | { type: 'done' };
