import { InitContextUpdatedEvent, MachineContext } from '../../types';

const initContextComplete = (
  context: MachineContext,
  event: InitContextUpdatedEvent,
) => {
  const device = context.device || event.payload.device;
  const authToken = context.authToken || event.payload.authToken;
  const opener = context.opener || event.payload.opener;
  const onboardingConfig =
    context.onboardingConfig || event.payload.onboardingConfig;
  const requirements = context.requirements || event.payload.requirements;

  return (
    device !== undefined &&
    authToken !== undefined &&
    opener !== undefined &&
    onboardingConfig !== undefined &&
    requirements !== undefined
  );
};

export default initContextComplete;
