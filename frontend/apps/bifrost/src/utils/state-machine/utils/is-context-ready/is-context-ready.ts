import type { MachineContext, MachineEvents } from '../../types';

const isUndefined = (x: unknown): x is undefined => x === undefined;

const isContextReady = (context: MachineContext, event: MachineEvents) => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const { payload } = event;
  const config = isUndefined(payload.config) ? context.config : payload.config;
  const bootstrapData = isUndefined(payload.bootstrapData) ? context.bootstrapData : payload.bootstrapData;

  const authToken = isUndefined(payload.authToken) ? context.authToken : payload.authToken;

  const publicKey = isUndefined(payload.publicKey) ? context.publicKey : payload.publicKey;

  return config !== undefined && bootstrapData !== undefined && authToken !== undefined && publicKey !== undefined;
};

export default isContextReady;
