import type { L10n } from '@onefootprint/footprint-js';
import type { IdDocOutcome, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { UserData } from '../../../../types';
import type { CommonIdvContext } from '../../../../utils/state-machine';
import type { MachineContext, MachineEvents } from './types';
import validateUserData from './utils/validate-bootstrap-data';

export type OnboardingMachineArgs = {
  config: PublicOnboardingConfig;
  userData: UserData;
  idvContext: CommonIdvContext;
  idDocOutcome?: IdDocOutcome;
  overallOutcome?: OverallOutcome;
  onClose?: () => void;
};

const createOnboardingMachine = (
  { config, userData, idvContext, idDocOutcome, overallOutcome, onClose }: OnboardingMachineArgs,
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
        userData: validateUserData(userData, config, l10n?.locale),
        idvContext,
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
                cond: context => !!context.idvContext.isTransfer,
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
