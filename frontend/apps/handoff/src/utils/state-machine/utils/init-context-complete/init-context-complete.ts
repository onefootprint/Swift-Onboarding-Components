import { Events, MachineContext, MachineEvents } from '../../types';

const initContextComplete = (context: MachineContext, event: MachineEvents) => {
  if (event.type !== Events.initContextUpdated) {
    return false;
  }
  const device = context.device || event.payload.device;
  const tenant = context.tenant || event.payload.tenant;
  const tenantPk = context.tenantPk || event.payload.tenantPk;
  const authToken = context.authToken || event.payload.authToken;

  return (
    device !== undefined &&
    tenant !== undefined &&
    tenantPk !== undefined &&
    authToken !== undefined
  );
};

export default initContextComplete;
