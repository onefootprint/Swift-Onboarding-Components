import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

const createDesktopMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'desktop',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        missingRequirements: {},
      },
      states: {
        init: {
          on: {
            receivedContext: [
              {
                target: 'success',
                actions: 'assignContext',
                cond: (context, event) =>
                  Object.keys(event.payload.missingRequirements).length === 0,
              },
              {
                target: 'deviceSupport',
                actions: 'assignContext',
              },
            ],
          },
        },
        deviceSupport: {
          always: [
            {
              target: 'qrRegister',
              cond: context =>
                context.device?.type !== 'mobile' ||
                !context.device?.hasSupportForWebauthn,
            },
            {
              target: 'success',
            },
          ],
        },
        qrRegister: {
          on: {
            scopedAuthTokenGenerated: {
              actions: ['assignScopedAuthToken'],
            },
            qrCodeLinkSentViaSms: {
              target: 'qrCodeSent',
            },
            qrCodeScanned: {
              target: 'qrCodeScanned',
            },
            qrRegisterSucceeded: {
              target: 'success',
            },
            qrRegisterFailed: {
              target: 'failure',
            },
            statusPollingErrored: {
              actions: ['clearScopedAuthToken'],
            },
          },
        },
        qrCodeScanned: {
          on: {
            qrCodeCanceled: {
              target: 'qrRegister',
              actions: ['clearScopedAuthToken'],
            },
            qrRegisterSucceeded: {
              target: 'success',
            },
            qrRegisterFailed: {
              target: 'failure',
            },
            statusPollingErrored: {
              target: 'qrRegister',
              actions: ['clearScopedAuthToken'],
            },
          },
        },
        qrCodeSent: {
          on: {
            qrCodeCanceled: {
              target: 'qrRegister',
              actions: ['clearScopedAuthToken'],
            },
            qrRegisterSucceeded: {
              target: 'success',
            },
            qrRegisterFailed: {
              target: 'failure',
            },
            statusPollingErrored: {
              target: 'qrRegister',
              actions: ['clearScopedAuthToken'],
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
          authToken: event.payload.authToken,
          device: event.payload.device,
          config: event.payload.config,
          missingRequirements: { ...event.payload.missingRequirements },
          idDocOutcome: event.payload.idDocOutcome,
        })),
        assignScopedAuthToken: assign((context, event) => ({
          ...context,
          scopedAuthToken: event.payload.scopedAuthToken,
        })),
        clearScopedAuthToken: assign(context => ({
          ...context,
          scopedAuthToken: undefined,
        })),
      },
    },
  );

export default createDesktopMachine;
