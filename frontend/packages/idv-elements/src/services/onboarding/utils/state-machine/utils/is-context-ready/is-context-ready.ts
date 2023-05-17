import { MachineContext, MachineEvents } from '../../types';

const isContextReady = (
  context: MachineContext,
  event: MachineEvents,
): boolean => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const device = context.device || event.payload.device;
  const config = context.config || event.payload.config;
  const alreadyAuthorized =
    context.alreadyAuthorized !== undefined
      ? context.alreadyAuthorized
      : event.payload.alreadyAuthorized;

  return (
    device !== undefined &&
    config !== undefined &&
    alreadyAuthorized !== undefined
  );
};

export default isContextReady;
