import type { MachineContext, MachineEvents } from '../../types';

const isContextReady = (context: MachineContext, event: MachineEvents): boolean => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const device = context.device || event.payload.device;
  if (!device) {
    return false;
  }
  const config = context.config || event.payload.config;
  if (!config) {
    return false;
  }
  return !!context.obConfigAuth || !!context.authToken;
};

export default isContextReady;
