import { assign, createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';

const createDesktopMachine = (initialContext: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'desktop',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: { ...initialContext },
      states: {
        init: {
          always: [
            {
              target: 'qrRegister',
              cond: context => context.device.type !== 'mobile',
            },
            {
              target: 'complete',
            },
          ],
        },
        qrRegister: {
          on: {
            scopedAuthTokenGenerated: {
              actions: ['assignScopedAuthToken'],
            },
            d2pSessionStarted: {
              target: 'processing',
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionCanceled: {
              actions: ['clearScopedAuthToken'],
            },
            d2pSessionExpired: {
              actions: ['clearScopedAuthToken'],
            },
            continueOnDesktop: {
              target: 'complete',
            },
            confirmationRequired: {
              target: 'confirmContinueOnDesktop',
            },
          },
        },
        confirmContinueOnDesktop: {
          on: {
            continueOnDesktop: {
              target: 'complete',
            },
            continueOnMobile: {
              target: 'qrRegister',
            },
          },
        },
        processing: {
          on: {
            d2pSessionCanceled: {
              target: 'qrRegister',
              actions: ['clearScopedAuthToken'],
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionExpired: {
              target: 'qrRegister',
              actions: ['clearScopedAuthToken'],
            },
          },
        },
        complete: {
          type: 'final',
        },
      },
    },
    {
      actions: {
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
