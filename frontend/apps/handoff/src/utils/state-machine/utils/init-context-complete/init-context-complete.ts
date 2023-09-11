import type { InitContextUpdatedEvent, MachineContext } from '../../types';

const initContextComplete = (
  context: MachineContext,
  event: InitContextUpdatedEvent,
) => {
  const authToken = context.authToken || event.payload.authToken;
  const opener = context.opener || event.payload.opener;
  const onboardingConfig =
    context.onboardingConfig || event.payload.onboardingConfig;

  return (
    authToken !== undefined &&
    opener !== undefined &&
    onboardingConfig !== undefined
  );
};

export default initContextComplete;
