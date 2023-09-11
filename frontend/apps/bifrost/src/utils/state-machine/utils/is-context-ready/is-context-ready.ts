import type { MachineContext, MachineEvents } from '../../types';

const isContextReady = (context: MachineContext, event: MachineEvents) => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const config = context.config || event.payload.config;
  const bootstrapData = context.bootstrapData || event.payload.bootstrapData;

  return config !== undefined && bootstrapData !== undefined;
};

export default isContextReady;
