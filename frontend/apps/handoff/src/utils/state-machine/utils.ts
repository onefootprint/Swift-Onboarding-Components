import { D2PStatus } from '@onefootprint/types';
import { TransitionsConfig } from 'xstate';

import { Events, MachineContext, MachineEvents, States } from './types';

const StatusReceivedTransitions: TransitionsConfig<
  MachineContext,
  MachineEvents
> = {
  [Events.statusReceived]: [
    {
      target: States.expired,
      cond: (context, event) => !!event.payload.isError,
    },
    {
      target: States.canceled,
      cond: (context, event) => event.payload.status === D2PStatus.canceled,
    },
    {
      target: States.complete,
      cond: (context, event) =>
        event.payload.status === D2PStatus.completed ||
        event.payload.status === D2PStatus.failed,
    },
  ],
};

export default StatusReceivedTransitions;
