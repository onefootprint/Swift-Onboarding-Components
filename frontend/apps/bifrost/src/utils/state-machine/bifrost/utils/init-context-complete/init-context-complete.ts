import { BifrostContext, BifrostEvent, Events } from '../../types';

const initContextComplete = (context: BifrostContext, event: BifrostEvent) => {
  if (event.type !== Events.initContextUpdated) {
    return false;
  }
  const device = context.device || event.payload.device;
  const config = context.config || event.payload.config;
  const bootstrapData = context.bootstrapData || event.payload.bootstrapData;

  return (
    device !== undefined && config !== undefined && bootstrapData !== undefined
  );
};

export default initContextComplete;
