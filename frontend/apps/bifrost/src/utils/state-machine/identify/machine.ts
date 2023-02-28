import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { BootstrapData } from '../bifrost/types';
import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

type IdentifyMachineArgs = {
  device: DeviceInfo;
  bootstrapData?: BootstrapData;
  config?: OnboardingConfig;
  identifierSuffix?: string;
};

const createIdentifyMachine = ({
  device,
  bootstrapData,
  config,
  identifierSuffix,
}: IdentifyMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'identify',
      initial: bootstrapData
        ? States.initBootstrap
        : States.emailIdentification,
      context: {
        device,
        bootstrapData: bootstrapData ?? {},
        config,
        identify: {
          identifierSuffix,
        },
        challenge: {},
      },
      states: {
        // New bootstrap transitions (not used in this machine for now)
        [States.initBootstrap]: {
          on: {
            [Events.bootstrapDataInvalid]: {
              target: States.emailIdentification,
              actions: [Actions.reset],
            },
            [Events.identifyFailed]: {
              target: States.emailIdentification,
              actions: [Actions.assignEmail, Actions.assignPhone],
            },
            [Events.identified]: {
              target: States.bootstrapChallenge,
              actions: [
                Actions.assignEmail,
                Actions.assignPhone,
                Actions.assignUserFound,
                Actions.assignSuccessfulIdentifier,
                Actions.assignAvailableChallengeKinds,
                Actions.assignHasSyncablePassKey,
              ],
            },
          },
        },
        [States.bootstrapChallenge]: {
          on: {
            [Events.identifyReset]: {
              target: States.emailIdentification,
              actions: [Actions.reset],
            },
            [Events.challengeSucceeded]: {
              target: States.success,
              actions: [Actions.assignAuthToken],
            },
          },
        },
        // Other transitions
        [States.emailIdentification]: {
          on: {
            [Events.identified]: [
              {
                target: States.phoneIdentification,
                actions: [
                  Actions.assignEmail,
                  Actions.assignUserFound,
                  Actions.assignSuccessfulIdentifier,
                  Actions.assignAvailableChallengeKinds,
                  Actions.assignHasSyncablePassKey,
                ],
                description:
                  'Transition to phone registration only if could not find user or will not be able to initiate a challenge',
                cond: (context, event) =>
                  !event.payload.userFound ||
                  !event.payload.availableChallengeKinds ||
                  event.payload.availableChallengeKinds.length === 0,
              },
              {
                target: States.challenge,
                actions: [
                  Actions.assignEmail,
                  Actions.assignUserFound,
                  Actions.assignSuccessfulIdentifier,
                  Actions.assignAvailableChallengeKinds,
                  Actions.assignHasSyncablePassKey,
                ],
              },
            ],
          },
        },
        [States.phoneIdentification]: {
          on: {
            [Events.navigatedToPrevPage]: {
              target: States.emailIdentification,
            },
            [Events.identifyReset]: {
              target: States.emailIdentification,
              actions: [Actions.reset],
            },
            [Events.identified]: {
              target: States.challenge,
              actions: [
                Actions.assignPhone,
                Actions.assignUserFound,
                Actions.assignSuccessfulIdentifier,
                Actions.assignAvailableChallengeKinds,
                Actions.assignHasSyncablePassKey,
              ],
            },
          },
        },
        [States.challenge]: {
          on: {
            [Events.navigatedToPrevPage]: [
              {
                target: States.phoneIdentification,
                cond: context =>
                  !context.identify.userFound || !!context.identify.phoneNumber,
              },
              {
                target: States.emailIdentification,
              },
            ],
            [Events.challengeSucceeded]: {
              target: States.success,
              actions: [Actions.assignAuthToken],
            },
          },
        },
        [States.success]: {
          type: 'final',
          data: {
            authToken: (context: MachineContext) => context.challenge.authToken,
            userFound: (context: MachineContext) => context.identify.userFound,
            email: (context: MachineContext) => context.identify.email,
          },
        },
      },
    },
    {
      actions: {
        [Actions.assignEmail]: assign((context, event) => {
          if (
            event.type !== Events.identified &&
            event.type !== Events.identifyFailed
          ) {
            return context;
          }
          const { email } = event.payload;
          if (!email) {
            return context;
          }
          context.identify.email = email;
          return context;
        }),
        [Actions.assignPhone]: assign((context, event) => {
          if (
            event.type !== Events.identified &&
            event.type !== Events.identifyFailed
          ) {
            return context;
          }
          const { phoneNumber } = event.payload;
          if (!phoneNumber) {
            return context;
          }
          context.identify.phoneNumber = phoneNumber;
          return context;
        }),
        [Actions.assignAvailableChallengeKinds]: assign((context, event) => {
          if (
            event.type === Events.identified &&
            event.payload.availableChallengeKinds
          ) {
            context.challenge.availableChallengeKinds =
              event.payload.availableChallengeKinds;
          }
          return context;
        }),
        [Actions.assignSuccessfulIdentifier]: assign((context, event) => {
          if (
            event.type === Events.identified &&
            event.payload.successfulIdentifier
          ) {
            context.identify.successfulIdentifier =
              event.payload.successfulIdentifier;
          }
          return context;
        }),
        [Actions.assignHasSyncablePassKey]: assign((context, event) => {
          if (event.type === Events.identified) {
            context.challenge.hasSyncablePassKey =
              event.payload.hasSyncablePassKey;
          }
          return context;
        }),
        [Actions.assignUserFound]: assign((context, event) => {
          if (event.type === Events.identified) {
            context.identify.userFound = event.payload.userFound;
          }
          return context;
        }),
        [Actions.assignAuthToken]: assign((context, event) => {
          if (event.type === Events.challengeSucceeded) {
            context.challenge.authToken = event.payload.authToken;
          }
          return context;
        }),
        [Actions.reset]: assign(context => {
          // Don't allow resetting the identifier suffix
          context.identify = {
            identifierSuffix: context.identify.identifierSuffix,
          };
          context.challenge = {};
          return context;
        }),
      },
    },
  );

export default createIdentifyMachine;
