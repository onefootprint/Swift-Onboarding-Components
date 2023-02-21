import { DeviceInfo } from '@onefootprint/hooks';
import legacyValidateBootstrapData from 'src/pages/identify/utils/legacy-validate-bootstrap-data';
// import validateBootstrapData from 'src/pages/identify/utils/validate-bootstrap-data';
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
  bootstrapData: rawBootstrapData,
  tenantPk,
  identifierSuffix,
}: IdentifyMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'identify',
      initial: rawBootstrapData
        ? States.legacyProcessBootstrapData
        : States.emailIdentification,
      context: {
        device,
        bootstrapData: rawBootstrapData ?? {},
        tenantPk,
        identifierSuffix,
      },
      states: {
        // Legacy bootstrap transitions
        [States.legacyProcessBootstrapData]: {
          entry: [Actions.assignLegacyBootstrapData],
          on: {
            [Events.legacyBootstrapDataProcessed]: {
              target: States.phoneVerification,
              actions: [Actions.assignChallenge, Actions.assignUserFound],
            },
            [Events.legacyBootstrapDataProcessErrored]: {
              target: States.emailIdentification,
            },
          },
        },

        // New bootstrap transitions
        // [States.initBootstrap]: {
        //   entry: [Actions.assignBootstrapData],
        //   on: {
        //     [Events.bootstrapIdentifyFailed]: [
        //       {
        //         target: States.emailIdentification,
        //         actions: [Actions.assignEmail, Actions.assignPhone],
        //         cond: (context, event) => !!event.payload.email,
        //       },
        //       {
        //         target: States.phoneRegistration,
        //         actions: [Actions.assignEmail, Actions.assignPhone],
        //         cond: (context, event) => !!event.payload.phoneNumber,
        //       },
        //     ],
        //   },
        // },
        // [States.bootstrapChallenge]: {
        //   on: {
        //     [Events.loginChallengeSucceeded]: {
        //       target: States.success,
        //       actions: [Actions.assignAuthToken],
        //     },
        //     [Events.loginWithDifferentAccount]: {
        //       target: States.emailIdentification,
        //       actions: [Actions.resetContext],
        //     },
        //   },
        // },

        // Other transitions
        [States.emailIdentification]: {
          on: {
            [Events.identifyCompleted]: [
              {
                target: States.phoneRegistration,
                actions: [Actions.assignEmail, Actions.assignUserFound],
                description:
                  'Transition to phone registration only if could not find user or cannot initiate a challenge',
                cond: (context, event) =>
                  !event.payload.userFound ||
                  (!!event.payload.availableChallengeKinds &&
                    !event.payload.availableChallengeKinds?.length),
              },
              {
                actions: [Actions.assignEmail, Actions.assignUserFound],
              },
            ],
            [Events.smsChallengeInitiated]: [
              {
                target: States.phoneVerification,
                actions: [Actions.assignChallenge],
              },
            ],
            [Events.biometricLoginSucceeded]: [
              {
                target: States.success,
                actions: [Actions.assignAuthToken],
              },
            ],
            [Events.biometricLoginFailed]: [
              {
                target: States.biometricLoginRetry,
              },
            ],
          },
        },
        [States.phoneRegistration]: {
          on: {
            [Events.navigatedToPrevPage]: {
              target: States.emailIdentification,
            },
            [Events.emailChangeRequested]: [
              {
                target: States.emailIdentification,
                actions: [Actions.resetContext],
              },
            ],
            [Events.identifyCompleted]: [
              {
                actions: [Actions.assignPhone, Actions.assignUserFound],
              },
            ],
            [Events.smsChallengeInitiated]: [
              {
                target: States.phoneVerification,
                actions: [Actions.assignChallenge],
              },
            ],
            [Events.biometricLoginSucceeded]: [
              {
                target: States.success,
                actions: [Actions.assignAuthToken],
              },
            ],
            [Events.biometricLoginFailed]: [
              {
                target: States.biometricLoginRetry,
              },
            ],
          },
        },
        [States.phoneVerification]: {
          on: {
            [Events.navigatedToPrevPage]: [
              {
                target: States.phoneRegistration,
                cond: context => !context.userFound || !!context.phone,
              },
              {
                target: States.emailIdentification,
              },
            ],
            [Events.smsChallengeInitiated]: [
              {
                actions: [Actions.assignChallenge],
              },
            ],
            [Events.smsChallengeSucceeded]: [
              {
                target: States.success,
                actions: [Actions.assignAuthToken],
              },
            ],
          },
        },
        [States.biometricLoginRetry]: {
          on: {
            [Events.biometricLoginSucceeded]: [
              {
                target: States.success,
                actions: [Actions.assignAuthToken],
              },
            ],
            [Events.smsChallengeInitiated]: [
              {
                target: States.phoneVerification,
                actions: [Actions.assignChallenge],
              },
            ],
          },
        },
        [States.success]: {
          type: 'final',
          data: {
            authToken: (context: MachineContext) => context.authToken,
            userFound: (context: MachineContext) => context.userFound,
            email: (context: MachineContext) => context.email,
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
          context.phone = phoneNumber;
          context.email = email;
          return context;
        }),

        // New Bootstrap Actions
        // [Actions.assignBootstrapData]: assign(context => {
        //   const { email, phoneNumber } = validateBootstrapData(
        //     context.bootstrapData,
        //   );
        //   context.phone = phoneNumber;
        //   context.email = email;
        //   return context;
        // }),

        // Other Actions
        [Actions.assignEmail]: assign((context, event) => {
          if (event.type === Events.identifyCompleted) {
            const emailIdentifier = Object.entries(
              event.payload.identifier,
            ).find(([key, value]) => key === 'email' && !!value);
            if (emailIdentifier) {
              const [, email] = emailIdentifier;
              context.email = email;
            }
          }
          return context;
        }),
        [Actions.assignPhone]: assign((context, event) => {
          if (event.type === Events.identifyCompleted) {
            const phoneIdentifier = Object.entries(
              event.payload.identifier,
            ).find(([key, value]) => key === 'phoneNumber' && !!value);
            if (phoneIdentifier) {
              const [, phone] = phoneIdentifier;
              context.phone = phone;
            }
          }
          return context;
        }),
        [Actions.assignUserFound]: assign((context, event) => {
          if (
            event.type === Events.identifyCompleted ||
            event.type === Events.legacyBootstrapDataProcessed
          ) {
            context.userFound = event.payload.userFound;
          }
          return context;
        }),
        [Actions.assignAuthToken]: assign((context, event) => {
          if (
            event.type === Events.smsChallengeSucceeded ||
            event.type === Events.biometricLoginSucceeded
          ) {
            context.authToken = event.payload.authToken;
          }
          return context;
        }),
        [Actions.resetContext]: assign(context => {
          context.email = undefined;
          context.phone = undefined;
          context.userFound = false;
          context.authToken = undefined;
          context.challengeData = undefined;
          return context;
        }),
        [Actions.assignChallenge]: assign((context, event) => {
          if (
            event.type !== Events.legacyBootstrapDataProcessed &&
            event.type !== Events.smsChallengeInitiated
          ) {
            return context;
          }
          const { challengeData } = event.payload;
          if (!challengeData) {
            return context;
          }
          context.challengeData = { ...challengeData };
          return context;
        }),
      },
    },
  );

export default createIdentifyMachine;
