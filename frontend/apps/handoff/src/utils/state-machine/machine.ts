import { D2PStatus } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
import type { MachineContext, MachineEvents } from './types';
import initContextComplete from './utils/init-context-complete';

export const createHandoffMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'handoff',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as Typegen0,
      initial: 'init',
      context: {},
      on: {
        reset: {
          target: 'init',
          actions: ['resetContext'],
        },
        statusReceived: [
          {
            target: 'expired',
            cond: (context, event) => !!event.payload.isError,
          },
          {
            target: 'canceled',
            cond: (context, event) =>
              event.payload.status === D2PStatus.canceled,
          },
          {
            target: 'complete',
            cond: (context, event) =>
              event.payload.status === D2PStatus.completed ||
              event.payload.status === D2PStatus.failed,
          },
        ],
      },
      states: {
        init: {
          on: {
            initContextUpdated: [
              {
                description:
                  'Only transition to next state if all required info is collected',
                actions: ['assignInitContext'],
                target: 'idv',
                cond: (context, event) => initContextComplete(context, event),
              },
              {
                actions: ['assignInitContext'],
              },
            ],
            d2pAlreadyCompleted: [
              {
                target: 'complete',
              },
            ],
            d2pCanceled: [
              {
                target: 'canceled',
              },
            ],
          },
        },
        idv: {
          on: {
            idvCompleted: {
              target: 'complete',
            },
          },
        },
        expired: {
          type: 'final',
        },
        canceled: {
          type: 'final',
        },
        complete: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignInitContext: assign((context, event) => {
          const {
            authToken,
            opener,
            onboardingConfig,
            idDocOutcome,
            updatedStatus,
          } = event.payload;
          context.opener = opener !== undefined ? opener : context.opener;
          context.authToken =
            authToken !== undefined ? authToken : context.authToken;
          context.onboardingConfig =
            onboardingConfig !== undefined
              ? onboardingConfig
              : context.onboardingConfig;
          context.idDocOutcome =
            idDocOutcome !== undefined
              ? event.payload.idDocOutcome
              : context.idDocOutcome;
          context.updatedStatus =
            updatedStatus !== undefined ? updatedStatus : context.updatedStatus;
          return context;
        }),
        resetContext: assign(() => ({})),
      },
    },
  );

const handoffMachine = createHandoffMachine();

export default handoffMachine;
