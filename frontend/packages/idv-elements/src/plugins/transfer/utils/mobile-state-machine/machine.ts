import { assign, createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';

const createMobileMachine = (initialContext: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'mobile',
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
              description: 'If not running on mobile',
              cond: context => context.device.type !== 'mobile',
              target: 'complete',
            },
            {
              cond: context => !!context.isSocialMediaBrowser,
              target: 'socialMediaBrowser',
            },
            {
              target: 'nonSocialMediaBrowser',
            },
          ],
        },
        nonSocialMediaBrowser: {
          always: [
            {
              target: 'newTabRequest',
              cond: context =>
                !!context.missingRequirements.liveness &&
                context.device.hasSupportForWebauthn,
            },
            {
              target: 'complete',
            },
          ],
        },
        socialMediaBrowser: {
          always: [
            {
              target: 'sms',
              description: 'If running in social media',
              cond: context => !!context.missingRequirements.idDoc,
            },
            {
              target: 'complete',
            },
          ],
        },
        sms: {
          on: {
            scopedAuthTokenGenerated: {
              actions: ['assignScopedAuthToken'],
            },
            d2pSessionStarted: {
              target: 'smsProcessing',
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionExpired: {
              actions: ['clearScopedAuthToken'],
            },
          },
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
        smsProcessing: {
          on: {
            d2pSessionCanceled: {
              target: 'sms',
              actions: ['clearScopedAuthToken'],
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionExpired: {
              target: 'sms',
              actions: ['clearScopedAuthToken'],
            },
          },
        },
        newTabProcessing: {
          on: {
            tabClosed: {
              actions: ['clearTab'],
            },
            d2pSessionCanceled: {
              target: 'newTabRequest',
              actions: ['clearScopedAuthToken'],
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionExpired: {
              target: 'newTabRequest',
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
        assignTab: assign((context, event) => ({
          ...context,
          tab: event.payload.tab,
        })),
        clearScopedAuthToken: assign(context => ({
          ...context,
          scopedAuthToken: undefined,
        })),
        clearTab: assign(context => ({
          ...context,
          tab: undefined,
        })),
      },
    },
  );

export default createMobileMachine;
