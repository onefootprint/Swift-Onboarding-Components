import { MachineContext, MachineEvents } from '../../types';

const isContextReady = (context: MachineContext, event: MachineEvents) => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const authToken = context.authToken || event.payload.authToken;
  const business = context.businessBoKycData || event.payload.businessBoKycData;
  const onboardingConfig =
    context.onboardingConfig || event.payload.onboardingConfig;

  return (
    authToken !== undefined &&
    business !== undefined &&
    onboardingConfig !== undefined
  );
};

export default isContextReady;
