import { assign, createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
import type { MachineContext, MachineEvents } from './types';

const createMobileMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'mobile',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as Typegen0,
      initial: 'init',
      context: {
        authToken: '',
        scopedAuthToken: '',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: false,
        },
      },
      states: {
        init: {
          on: {
            receivedContext: {
              target: 'deviceSupport',
              actions: 'assignContext',
            },
          },
        },
        deviceSupport: {
          always: [
            {
              target: 'newTabRequest',
              cond: context =>
                context.device.type === 'mobile' &&
                context.device.hasSupportForWebauthn,
            },
            {
              target: 'skipLiveness',
            },
          ],
        },
        newTabRequest: {
          on: {
            scopedAuthTokenGenerated: {
              actions: ['assignScopedAuthToken'],
            },
            newTabOpened: {
              target: 'newTabProcessing',
              actions: ['assignTab'],
            },
          },
        },
        newTabProcessing: {
          on: {
            newTabRegisterCanceled: {
              target: 'newTabRequest',
            },
            newTabRegisterSucceeded: {
              target: 'success',
            },
            newTabRegisterFailed: {
              target: 'skipLiveness',
            },
            statusPollingErrored: {
              target: 'newTabRequest',
              actions: ['clearScopedAuthToken'],
            },
          },
        },
        skipLiveness: {
          on: {
            livenessSkipped: {
              target: 'failure',
            },
          },
        },
        success: {
          type: 'final',
        },
        failure: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignContext: assign((context, event) => ({
          ...context,
          device: event.payload.device,
          authToken: event.payload.authToken,
          idDocOutcome: event.payload.idDocOutcome,
          config: event.payload.config,
        })),
        assignScopedAuthToken: assign((context, event) => ({
          ...context,
          scopedAuthToken: event.payload.scopedAuthToken,
        })),
        assignTab: assign((context, event) => ({
          ...context,
          tab: event.payload.tab,
        })),
        clearScopedAuthToken: assign(context => ({
          ...context,
          scopedAuthToken: undefined,
        })),
      },
    },
  );

export default createMobileMachine;
