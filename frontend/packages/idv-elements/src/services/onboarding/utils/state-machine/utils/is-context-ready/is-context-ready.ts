import type { MachineContext, MachineEvents } from '../../types';

const isContextReady = (
  context: MachineContext,
  event: MachineEvents,
): boolean => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const device = context.device || event.payload.device;
  const config = context.config || event.payload.config;

  return device !== undefined && config !== undefined;
};

export default isContextReady;
