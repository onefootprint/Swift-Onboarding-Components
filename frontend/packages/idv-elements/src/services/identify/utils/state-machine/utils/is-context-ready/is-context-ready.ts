import { MachineContext, MachineEvents } from '../../types';

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
  const hasOnboarding = !!context.onboarding.tenantPk;
  if (!hasOnboarding) {
    return true;
  }
  const config = context.onboarding.config || event.payload.config;
  return !!config;
};

export default isContextReady;
