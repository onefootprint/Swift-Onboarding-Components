import { MachineContext, MachineEvents } from '../../types';

const isContextReady = (context: MachineContext, event: MachineEvents) => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const device = context.device || event.payload.device;
  const config = context.config || event.payload.config;
  const receivedToken =
    typeof context.validationToken === 'string' ||
    typeof event.payload.validationToken === 'string';

  return device !== undefined && config !== undefined && !!receivedToken;
};

export default isContextReady;
