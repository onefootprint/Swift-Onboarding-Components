import type { MachineContext, MachineEvents } from '../../types';

const shouldShowIdentify = (context: MachineContext, event: MachineEvents): boolean => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }

  return !context.isTransfer;
};

export default shouldShowIdentify;
