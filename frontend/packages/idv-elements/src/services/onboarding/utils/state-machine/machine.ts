import type {
  IdDIData,
  IdDocOutcomes,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import type { MachineContext, MachineEvents } from './types';

export type OnboardingMachineArgs = {
  config: PublicOnboardingConfig;
  device: DeviceInfo;
  authToken: string;
  bootstrapData?: IdDIData; // TODO: generalize this more in the next iteration
  userFound?: boolean;
  isTransfer?: boolean;
  idDocOutcome?: IdDocOutcomes;
  onClose?: () => void;
  onComplete?: (validationToken?: string, delay?: number) => void;
};

const createOnboardingMachine = ({
  config,
  device,
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
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'requirements',
      context: {
        config,
        device,
        authToken,
        bootstrapData,
        userFound,
        isTransfer,
        idDocOutcome,
        onClose,
        onComplete,
      },
      states: {
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
        complete: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignValidationToken: assign((context, event) => ({
          ...context,
          validationToken: event.payload.validationToken,
        })),
      },
    },
  );

export default createOnboardingMachine;
