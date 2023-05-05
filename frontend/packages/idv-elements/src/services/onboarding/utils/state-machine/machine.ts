import { IdDIData, ObConfigAuth } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';

export type OnboardingMachineArgs = {
  obConfigAuth: ObConfigAuth;
  authToken: string;
  data?: IdDIData; // TODO: generalize this more in the next iteration
  sandboxSuffix?: string; // only if in sandbox mode
  userFound?: boolean;
  isTransfer?: boolean;
  onClose?: () => void;
  onComplete?: (validationToken: string, delay?: number) => void;
};

const createOnboardingMachine = ({
  obConfigAuth,
  authToken,
  data = {},
  sandboxSuffix,
  userFound,
  isTransfer,
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
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        obConfigAuth,
        authToken,
        data,
        sandboxSuffix,
        userFound,
        isTransfer,
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
