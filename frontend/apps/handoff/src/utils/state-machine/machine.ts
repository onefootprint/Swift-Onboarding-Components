import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';
import StatusReceivedTransitions from './utils';

export const createHandoffMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'handoff',
      initial: States.init,
      context: {},
      states: {
        [States.init]: {
          on: {
            [Events.authTokenReceived]: [
              {
                cond: context => !!context.device && !!context.tenant,
                actions: [Actions.assignAuthToken, Actions.assignTenantPk],
                target: States.checkRequirements,
              },
              {
                actions: [Actions.assignAuthToken, Actions.assignTenantPk],
              },
            ],
            [Events.tenantInfoReceived]: [
              {
                cond: context => !!context.device && !!context.authToken,
                actions: [Actions.assignTenant],
                target: States.checkRequirements,
              },
              {
                actions: [Actions.assignTenant],
              },
            ],
            [Events.deviceInfoIdentified]: [
              {
                cond: context => !!context.tenant && !!context.authToken,
                actions: [Actions.assignDeviceInfo],
                target: States.checkRequirements,
              },
              {
                actions: [Actions.assignDeviceInfo],
              },
            ],
          },
        },
        [States.checkRequirements]: {
          on: {
            [Events.requirementsReceived]: [
              {
                target: States.liveness,
                actions: [Actions.assignRequirements],
                cond: (context, event) => !!event.payload.missingLiveness,
              },
              {
                target: States.idScan,
                actions: [Actions.assignRequirements],
                cond: (context, event) => !!event.payload.missingIdDocument,
              },
              {
                target: States.complete,
              },
            ],
            ...StatusReceivedTransitions,
          },
        },
        [States.liveness]: {
          on: {
            [Events.livenessCompleted]: [
              {
                target: States.idScan,
                cond: context => !!context.requirements?.missingIdDocument,
              },
              {
                target: States.complete,
              },
            ],
            ...StatusReceivedTransitions,
          },
        },
        [States.idScan]: {
          on: {
            [Events.idScanCompleted]: {
              target: States.complete,
            },
            ...StatusReceivedTransitions,
          },
        },
        [States.expired]: {
          type: 'final',
        },
        [States.canceled]: {
          type: 'final',
        },
        [States.complete]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignDeviceInfo]: assign((context, event) => {
          if (event.type === Events.deviceInfoIdentified) {
            context.device = {
              type: event.payload.type,
              hasSupportForWebauthn: event.payload.hasSupportForWebauthn,
            };
          }
          return context;
        }),
        [Actions.assignAuthToken]: assign((context, event) => {
          if (event.type === Events.authTokenReceived) {
            context.authToken = event.payload.authToken;
          }
          return context;
        }),
        [Actions.assignRequirements]: assign((context, event) => {
          if (event.type === Events.requirementsReceived) {
            context.requirements = {
              ...event.payload,
            };
          }
          return context;
        }),
        [Actions.assignTenantPk]: assign((context, event) => {
          if (event.type === Events.authTokenReceived) {
            context.tenantPk = event.payload.tenantPk;
          }
          return context;
        }),
        [Actions.assignTenant]: assign((context, event) => {
          if (event.type === Events.tenantInfoReceived) {
            context.tenant = event.payload.tenant;
          }
          return context;
        }),
      },
    },
  );

const handoffMachine = createHandoffMachine();

export default handoffMachine;
