import { UserData } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';

export type OnboardingMachineArgs = {
  tenantPk: string;
  authToken: string;
  userData?: UserData;
  sandboxSuffix?: string; // only if in sandbox mode
  userFound?: boolean;
  onClose?: () => void;
  onComplete?: (validationToken: string, delay?: number) => void;
};

const createOnboardingMachine = ({
  tenantPk,
  authToken,
  userData,
  sandboxSuffix,
  userFound,
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
        userData: userData ?? {},
        sandboxSuffix,
        userFound,
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
              // TODO: For now, for the demo, we are unconditionally showing the authorize screen
              // every time the user signs-in even if they previously onboarded.
              {
                target: 'authorize',
                cond: (context, event) =>
                  isContextReady(context, event) &&
                  !!event.payload.validationToken,
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
            requirementsCompleted: {
              target: 'authorize',
            },
          },
        },
        authorize: {
          on: {
            authorized: {
              target: 'authorized',
              actions: ['assignValidationToken'],
            },
          },
        },
        configInvalid: {
          type: 'final',
        },
        authorized: {
          on: {
            close: {
              target: 'complete',
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
