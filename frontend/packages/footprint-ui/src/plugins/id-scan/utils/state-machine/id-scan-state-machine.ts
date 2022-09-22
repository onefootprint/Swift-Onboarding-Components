import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

const createIdScanMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      id: 'idScan',
      initial: States.init,
      context: {
        retryCount: 0,
      },
      states: {
        [States.init]: {
          on: {
            [Events.receivedContext]: {
              target: States.idCountryAndTypeSelection,
              actions: Actions.assignContext,
            },
          },
        },
        [States.idCountryAndTypeSelection]: {
          on: {
            [Events.idCountryAndTypeSelected]: [
              {
                target: States.success,
                actions: Actions.assignIdCountryAndType,
              },
            ],
          },
        },
        [States.success]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignContext]: assign((context, event) => {
          if (event.type === Events.receivedContext) {
            const { authToken, tenantInfo, deviceInfo } = event.payload;
            context.authToken = authToken;
            context.tenantInfo = tenantInfo;
            context.deviceInfo = deviceInfo;
          }
          return context;
        }),
        [Actions.assignIdCountryAndType]: assign((context, event) => {
          if (event.type === Events.idCountryAndTypeSelected) {
            context.type = event.payload.type;
            context.country = event.payload.country;
          }
          return context;
        }),
      },
    },
  );

export default createIdScanMachine;
