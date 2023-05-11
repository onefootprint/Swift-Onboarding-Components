import { IdDIData } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';

export type OnboardingMachineArgs = {
  tenantPk: string;
  authToken: string;
  data?: IdDIData; // TODO: generalize this more in the next iteration
  sandboxSuffix?: string; // only if in sandbox mode
  userFound?: boolean;
  isTransfer?: boolean;
  onClose?: () => void;
  onComplete?: (validationToken: string, delay?: number) => void;
};

const createOnboardingMachine = ({
  tenantPk,
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
        tenantPk,
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
              // TODO can simplify this logic when validationToken is separate from authorize
              {
                target: 'complete',
                cond: (_, event) => !!event.payload.validationToken,
                actions: ['assignInitContext', 'assignValidationToken'],
              },
              {
                target: 'requirements',
                cond: (context, event) => isContextReady(context, event),
                actions: ['assignInitContext', 'assignValidationToken'],
              },
              {
                actions: ['assignInitContext', 'assignValidationToken'],
              },
            ],
          },
        },
        requirements: {
          on: {
            requirementsCompleted: [
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
