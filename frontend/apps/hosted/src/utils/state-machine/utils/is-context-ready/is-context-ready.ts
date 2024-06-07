import type { MachineContext, MachineEvents } from '../../types';

const isContextReady = (context: MachineContext, event: MachineEvents) => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const authToken = context.authToken || event.payload.authToken;
  const obConfigAuth = context.obConfigAuth || event.payload.obConfigAuth;
  const onboardingConfig = context.onboardingConfig || event.payload.onboardingConfig;

  if (!onboardingConfig) {
    return false;
  }
  return !!authToken || !!obConfigAuth;
};

export default isContextReady;
