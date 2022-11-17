import { BifrostContext, BifrostEvent, Events } from '../types';

const initContextComplete = (context: BifrostContext, event: BifrostEvent) => {
  if (event.type !== Events.initContextUpdated) {
    return false;
  }
  const device = context.device || event.payload.device;
  const tenant = context.tenant || event.payload.tenant;
  const identifyType = context.identifyType || event.payload.identifyType;

  return (
    device !== undefined && tenant !== undefined && identifyType !== undefined
  );
};

export default initContextComplete;
