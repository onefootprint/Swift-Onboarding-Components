import { MachineContext, MachineEvents } from '../../types';

const isContextReady = (context: MachineContext, event: MachineEvents) => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }
  const authToken = context.authToken || event.payload.authToken;
  const tenantPk = context.tenantPk || event.payload.tenantPk;
  const businessBoKycData =
    context.businessBoKycData || event.payload.businessBoKycData;
  const onboardingConfig =
    context.onboardingConfig || event.payload.onboardingConfig;

  // We are either in full bifrost mode or just doing a KYC on a BO
  return !!(
    (authToken && businessBoKycData && onboardingConfig && tenantPk) ||
    (tenantPk && onboardingConfig)
  );
};

export default isContextReady;
