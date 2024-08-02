import { ComponentsSdkTypes, type MachineContext, type MachineEvents } from '../../types';

const shouldShowSandbox = (context: MachineContext, event: MachineEvents): boolean => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }

  const { componentsSdkContext, overallOutcome, idDocOutcome } = context;
  const isMobileComponentSdk = componentsSdkContext?.componentsSdkType === ComponentsSdkTypes.MOBILE;
  const skipRelayToComponents = componentsSdkContext?.skipRelayToComponents;
  if (isMobileComponentSdk && skipRelayToComponents) {
    // this means we already have the auth token i.e. we asked for sandbox outcome already before the identify step
    return false;
  }

  const config = context.config || event.payload.config;
  const requiresIdDocOutcome = config?.requiresIdDoc && !idDocOutcome;
  const requiresOverallOutcome = !overallOutcome;
  return !config?.isLive && !context.isTransfer && (requiresIdDocOutcome || requiresOverallOutcome);
};

export default shouldShowSandbox;
