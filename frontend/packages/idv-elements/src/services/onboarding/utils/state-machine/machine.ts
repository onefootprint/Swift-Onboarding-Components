import type { IdDIData, IdDocOutcomes } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
import type { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';

export type OnboardingMachineArgs = {
  authToken: string;
  bootstrapData?: IdDIData; // TODO: generalize this more in the next iteration
  userFound?: boolean;
  isTransfer?: boolean;
  idDocOutcome?: IdDocOutcomes;
  onClose?: () => void;
  onComplete?: (validationToken?: string, delay?: number) => void;
};

const createOnboardingMachine = ({
  authToken,
  bootstrapData = {},
  userFound,
  isTransfer,
  idDocOutcome,
  onClose,
  onComplete,
}: OnboardingMachineArgs) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'onboarding',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as Typegen0,
      initial: 'init',
      context: {
        authToken,
        bootstrapData,
        userFound,
        isTransfer,
        idDocOutcome,
        onClose,
        onComplete,
      },
      states: {
        init: {
          on: {
            configRequestFailed: {
              target: 'configInvalid',
            },
            initContextUpdated: [
              {
                target: 'requirements',
                cond: (context, event) => isContextReady(context, event),
                actions: ['assignInitContext'],
              },
              {
                actions: ['assignInitContext'],
              },
            ],
          },
        },
        requirements: {
          on: {
            requirementsCompleted: [
              // Transfer app doesn't get validation token
              {
                target: 'complete',
                cond: context => !!context.isTransfer,
              },
              {
                target: 'validate',
              },
            ],
          },
        },
        validate: {
          on: {
            validationComplete: [
              {
                target: 'complete',
                actions: ['assignValidationToken'],
              },
            ],
          },
        },
        configInvalid: {
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
          const { device, config } = event.payload;
          context.device = device !== undefined ? device : context.device;
          context.config = config !== undefined ? config : context.config;
          return context;
        }),
        assignValidationToken: assign((context, event) => ({
          ...context,
          validationToken: event.payload.validationToken,
        })),
      },
    },
  );

export default createOnboardingMachine;
