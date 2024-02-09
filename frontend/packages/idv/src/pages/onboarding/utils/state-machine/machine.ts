import type { L10n } from '@onefootprint/footprint-js';
import type {
  IdDIData,
  IdDocOutcome,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import type { MachineContext, MachineEvents } from './types';
import validateBootstrapData from './utils/validate-bootstrap-data';

export type OnboardingMachineArgs = {
  config: PublicOnboardingConfig;
  device: DeviceInfo;
  authToken: string;
  bootstrapData?: IdDIData; // TODO: generalize this more in the next iteration
  userFound?: boolean;
  isTransfer?: boolean;
  idDocOutcome?: IdDocOutcome;
  overallOutcome?: OverallOutcome;
  onClose?: () => void;
};

const createOnboardingMachine = (
  {
    config,
    device,
    authToken,
    bootstrapData = {},
    userFound,
    isTransfer,
    idDocOutcome,
    overallOutcome,
    onClose,
  }: OnboardingMachineArgs,
  l10n?: L10n,
) =>
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
        bootstrapData: validateBootstrapData(bootstrapData, l10n?.locale),
        userFound,
        isTransfer,
        idDocOutcome,
        overallOutcome,
        onClose,
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
