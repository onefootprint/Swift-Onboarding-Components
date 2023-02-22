import { DeviceInfo } from '@onefootprint/hooks';
import legacyValidateBootstrapData from 'src/pages/identify/utils/legacy-validate-bootstrap-data';
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
  tenantPk?: string;
  identifierSuffix?: string;
};

const createIdentifyMachine = ({
  device,
  bootstrapData,
  tenantPk,
  identifierSuffix,
}: IdentifyMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'identify',
      initial: bootstrapData
        ? States.legacyProcessBootstrapData
        : States.emailIdentification,
      context: {
        device,
        bootstrapData: bootstrapData ?? {},
        tenantPk,
        identify: {
          identifierSuffix,
        },
        challenge: {},
      },
      states: {
        // Legacy bootstrap transitions
        [States.legacyProcessBootstrapData]: {
          entry: [Actions.assignLegacyBootstrapData],
          on: {
            [Events.legacyBootstrapDataProcessed]: {
              target: States.phoneVerification,
              actions: [Actions.assignChallengeData, Actions.assignUserFound],
            },
            [Events.legacyBootstrapDataProcessErrored]: {
              target: States.emailIdentification,
            },
          },
        },
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
            [Events.challengeSucceeded]: {
              target: States.success,
              actions: [Actions.assignAuthToken],
            },
            [Events.identifyReset]: {
              target: States.emailIdentification,
              actions: [Actions.reset],
            },
          },
        },
        // Other transitions
        [States.emailIdentification]: {
          on: {
            [Events.identified]: [
              {
                target: States.phoneRegistration,
                actions: [
                  Actions.assignEmail,
                  Actions.assignUserFound,
                  Actions.assignSuccessfulIdentifier,
                  Actions.assignAvailableChallengeKinds,
                  Actions.assignHasSyncablePassKey,
                ],
                description:
                  'Transition to phone registration only if could not find user or cannot initiate a challenge',
                cond: (context, event) =>
                  !event.payload.userFound ||
                  (!!event.payload.availableChallengeKinds &&
                    !event.payload.availableChallengeKinds?.length),
              },
              {
                actions: [
                  Actions.assignEmail,
                  Actions.assignUserFound,
                  Actions.assignSuccessfulIdentifier,
                  Actions.assignAvailableChallengeKinds,
                  Actions.assignHasSyncablePassKey,
                ],
              },
            ],
            [Events.challengeInitiated]: {
              target: States.phoneVerification,
              actions: [Actions.assignChallengeData],
            },

            [Events.challengeSucceeded]: {
              target: States.success,
              actions: [Actions.assignAuthToken],
            },

            [Events.challengeFailed]: {
              target: States.biometricLoginRetry,
            },
          },
        },
        [States.phoneRegistration]: {
          on: {
            [Events.navigatedToPrevPage]: {
              target: States.emailIdentification,
            },
            [Events.identifyReset]: {
              target: States.emailIdentification,
              actions: [Actions.reset],
            },
            [Events.identified]: {
              actions: [
                Actions.assignPhone,
                Actions.assignUserFound,
                Actions.assignSuccessfulIdentifier,
                Actions.assignAvailableChallengeKinds,
                Actions.assignHasSyncablePassKey,
              ],
            },
            [Events.challengeInitiated]: {
              target: States.phoneVerification,
              actions: [Actions.assignChallengeData],
            },
            [Events.challengeSucceeded]: {
              target: States.success,
              actions: [Actions.assignAuthToken],
            },
            [Events.challengeFailed]: {
              target: States.biometricLoginRetry,
            },
          },
        },
        [States.phoneVerification]: {
          on: {
            [Events.navigatedToPrevPage]: [
              {
                target: States.phoneRegistration,
                cond: context =>
                  !context.identify.userFound || !!context.identify.phoneNumber,
              },
              {
                target: States.emailIdentification,
              },
            ],
            [Events.challengeInitiated]: {
              actions: [Actions.assignChallengeData],
            },

            [Events.challengeSucceeded]: {
              target: States.success,
              actions: [Actions.assignAuthToken],
            },
          },
        },
        [States.biometricLoginRetry]: {
          on: {
            [Events.challengeInitiated]: {
              target: States.phoneVerification,
              actions: [Actions.assignChallengeData],
            },
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
        // Legacy Bootstrap Actions
        [Actions.assignLegacyBootstrapData]: assign(context => {
          const { email, phoneNumber } = legacyValidateBootstrapData(
            context.bootstrapData,
          );
          context.identify.phoneNumber = phoneNumber;
          context.identify.email = email;
          return context;
        }),

        // Other Actions
        [Actions.assignEmail]: assign((context, event) => {
          if (event.type === Events.identified) {
            context.identify.email = event.payload.email;
          }
          return context;
        }),
        [Actions.assignPhone]: assign((context, event) => {
          if (event.type === Events.identified) {
            context.identify.phoneNumber = event.payload.phoneNumber;
          }
          return context;
        }),
        [Actions.assignAvailableChallengeKinds]: assign((context, event) => {
          if (event.type === Events.identified) {
            context.challenge.availableChallengeKinds =
              event.payload.availableChallengeKinds;
          }
          return context;
        }),
        [Actions.assignSuccessfulIdentifier]: assign((context, event) => {
          if (event.type === Events.identified) {
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
          if (
            event.type === Events.identified ||
            event.type === Events.legacyBootstrapDataProcessed
          ) {
            context.identify.userFound = event.payload.userFound;
          }
          return context;
        }),
        [Actions.assignChallengeData]: assign((context, event) => {
          if (
            event.type === Events.legacyBootstrapDataProcessed ||
            event.type === Events.challengeInitiated
          ) {
            context.challenge.challengeData = event.payload.challengeData;
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
