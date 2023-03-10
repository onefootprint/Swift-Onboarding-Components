import { MachineContext, MachineEvents } from '../../types';

const shouldShowSandboxOutcome = (
  context: MachineContext,
  event: MachineEvents,
) => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const device = context.device || event.payload.device;
  const config = context.config || event.payload.config;
  const bootstrapData = context.bootstrapData || event.payload.bootstrapData;

  return (
    device !== undefined &&
    config !== undefined &&
    bootstrapData !== undefined &&
    !config.isLive
  );
};

export default shouldShowSandboxOutcome;
