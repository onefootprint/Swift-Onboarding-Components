import type { MachineContext, MachineEvents } from '../../types';

const isUndefined = (x: unknown): x is undefined => x === undefined;

const isContextReady = (context: MachineContext, event: MachineEvents) => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const { payload } = event;
  const config = isUndefined(payload.config) ? context.config : payload.config;
  const bootstrapData = isUndefined(payload.bootstrapData)
    ? context.bootstrapData
    : payload.bootstrapData;

  const authToken = isUndefined(payload.authToken)
    ? context.authToken
    : payload.authToken;

  return (
    config !== undefined &&
    bootstrapData !== undefined &&
    authToken !== undefined
  );
};

export default isContextReady;
