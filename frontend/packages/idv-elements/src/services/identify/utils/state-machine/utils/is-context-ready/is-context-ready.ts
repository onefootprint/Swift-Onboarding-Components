import type { MachineContext, MachineEvents } from '../../types';

const isContextReady = (
  context: MachineContext,
  event: MachineEvents,
): boolean => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const device = context.device || event.payload.device;
  if (!device) {
    return false;
  }
  const hasObConfigAuth = !!context.obConfigAuth;
  if (!hasObConfigAuth) {
    return true;
  }
  const config = context.config || event.payload.config;
  return !!config;
};

export default isContextReady;
