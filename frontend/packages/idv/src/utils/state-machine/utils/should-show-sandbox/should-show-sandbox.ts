import { ComponentsSdkTypes, type MachineContext, type MachineEvents } from '../../types';

const shouldShowSandbox = (context: MachineContext, event: MachineEvents): boolean => {
  if (event.type !== 'initContextUpdated') {
    return false;
  }

  const { componentsSdkContext } = context;
  const isMobileComponentSdk = componentsSdkContext?.componentsSdkType === ComponentsSdkTypes.MOBILE;
  const skipRelayToComponents = componentsSdkContext?.skipRelayToComponents;
  if (isMobileComponentSdk && skipRelayToComponents) {
    // this means we already have the auth token i.e. we asked for sandbox outcome already before the identify step
    return false;
  }

  const config = context.config || event.payload.config;
  return !config?.isLive && !context.isTransfer;
};

export default shouldShowSandbox;
