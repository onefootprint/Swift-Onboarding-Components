import type { MachineContext, MachineEvents } from '../../types';

const shouldShowSandbox = (context: MachineContext, event: MachineEvents): boolean => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }

  const config = context.config || event.payload.config;
  return !config?.isLive && !context.isTransfer;
};

export default shouldShowSandbox;
