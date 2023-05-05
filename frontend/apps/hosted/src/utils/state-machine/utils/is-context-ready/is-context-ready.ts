import { MachineContext, MachineEvents } from '../../types';

const isContextReady = (context: MachineContext, event: MachineEvents) => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const obConfigAuth = context.obConfigAuth || event.payload.obConfigAuth;
  const onboardingConfig =
    context.onboardingConfig || event.payload.onboardingConfig;

  return !!obConfigAuth && !!onboardingConfig;
};

export default isContextReady;
