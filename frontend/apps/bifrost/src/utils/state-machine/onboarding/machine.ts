import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import createOnboardingRequirementsMachine from '../onboarding-requirements/machine';
import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

export type OnboardingMachineArgs = {
  userFound: boolean;
  device: DeviceInfo;
  config: OnboardingConfig;
  authToken: string;
};

const createOnboardingMachine = ({
  userFound,
  device,
  authToken,
  config,
}: OnboardingMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'onboarding',
      initial: States.initOnboarding,
      context: {
        userFound,
        device,
        authToken,
        config,
      },
      states: {
        [States.initOnboarding]: {
          on: {
            [Events.onboardingInitialized]: [
              // TODO: Replace this with the one below. For now, for the demo, we are unconditionally
              // showing the authorize screen everytime the user signs-in even if they previously onboarded.
              // {
              //   target: States.success,
              //   cond: (context, event) => !!event.payload.validationToken,
              //   actions: [Actions.assignValidationToken],
              // },
              {
                target: States.authorize,
                cond: (context, event) => !!event.payload.validationToken,
                actions: [Actions.assignValidationToken],
              },
              {
                target: States.onboardingRequirements,
              },
            ],
          },
        },
        [States.onboardingRequirements]: {
          invoke: {
            id: 'onboardingRequirements',
            src: context =>
              createOnboardingRequirementsMachine({
                userFound: context.userFound,
                device: context.device,
                authToken: context.authToken!,
                config: context.config,
              }),
            onDone: {
              target: States.authorize,
            },
          },
        },
        [States.authorize]: {
          on: {
            [Events.authorized]: {
              target: States.success,
              actions: [Actions.assignValidationToken, Actions.assignStatus],
            },
          },
        },
        [States.success]: {
          type: 'final',
          data: {
            validationToken: (context: MachineContext) =>
              context.validationToken,
            status: (context: MachineContext) => context.status,
          },
        },
      },
    },
    {
      actions: {
        [Actions.assignValidationToken]: assign((context, event) => {
          if (
            event.type === Events.onboardingInitialized ||
            event.type === Events.authorized
          ) {
            context.validationToken = event.payload.validationToken;
          }
          return context;
        }),
        [Actions.assignStatus]: assign((context, event) => {
          if (event.type === Events.authorized) {
            context.status = event.payload.status;
          }
          return context;
        }),
      },
    },
  );

export default createOnboardingMachine;
