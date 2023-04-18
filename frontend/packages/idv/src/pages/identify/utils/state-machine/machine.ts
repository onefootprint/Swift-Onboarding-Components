import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { BootstrapData } from '../../../../types';
import { MachineContext, MachineEvents } from './types';

export type IdentifyMachineArgs = {
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
  createMachine(
    {
      predictableActionArguments: true,
      id: 'identify',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: bootstrapData ? 'initBootstrap' : 'emailIdentification',
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
        initBootstrap: {
          on: {
            bootstrapDataInvalid: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
            identifyFailed: {
              target: 'emailIdentification',
              actions: ['assignEmail', 'assignPhone'],
            },
            identified: {
              target: 'bootstrapChallenge',
              actions: [
                'assignEmail',
                'assignPhone',
                'assignUserFound',
                'assignSuccessfulIdentifier',
                'assignAvailableChallengeKinds',
                'assignHasSyncablePassKey',
              ],
            },
          },
        },
        bootstrapChallenge: {
          on: {
            identifyReset: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
            challengeSucceeded: {
              target: 'success',
              actions: ['assignAuthToken'],
            },
          },
        },
        // Other transitions
        emailIdentification: {
          on: {
            identified: [
              {
                target: 'phoneIdentification',
                actions: [
                  'assignEmail',
                  'assignUserFound',
                  'assignSuccessfulIdentifier',
                  'assignAvailableChallengeKinds',
                  'assignHasSyncablePassKey',
                ],
                description:
                  'Transition to phone registration only if could not find user or will not be able to initiate a challenge',
                cond: (context, event) =>
                  !event.payload.userFound ||
                  !event.payload.availableChallengeKinds ||
                  event.payload.availableChallengeKinds.length === 0,
              },
              {
                target: 'challenge',
                actions: [
                  'assignEmail',
                  'assignUserFound',
                  'assignSuccessfulIdentifier',
                  'assignAvailableChallengeKinds',
                  'assignHasSyncablePassKey',
                ],
              },
            ],
          },
        },
        phoneIdentification: {
          on: {
            navigatedToPrevPage: {
              target: 'emailIdentification',
            },
            identifyReset: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
            identified: {
              target: 'challenge',
              actions: [
                'assignPhone',
                'assignUserFound',
                'assignSuccessfulIdentifier',
                'assignAvailableChallengeKinds',
                'assignHasSyncablePassKey',
              ],
            },
          },
        },
        challenge: {
          on: {
            navigatedToPrevPage: [
              {
                target: 'phoneIdentification',
                cond: context =>
                  !context.identify.userFound || !!context.identify.phoneNumber,
              },
              {
                target: 'emailIdentification',
              },
            ],
            challengeSucceeded: {
              target: 'success',
              actions: ['assignAuthToken'],
            },
          },
        },
        success: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignEmail: assign((context, event) => {
          const { email } = event.payload;
          if (!email) {
            return context;
          }
          context.identify.email = email;
          return context;
        }),
        assignPhone: assign((context, event) => {
          const { phoneNumber } = event.payload;
          if (!phoneNumber) {
            return context;
          }
          context.identify.phoneNumber = phoneNumber;
          return context;
        }),
        assignAvailableChallengeKinds: assign((context, event) => {
          if (event.payload.availableChallengeKinds) {
            context.challenge.availableChallengeKinds =
              event.payload.availableChallengeKinds;
          }
          return context;
        }),
        assignSuccessfulIdentifier: assign((context, event) => {
          if (event.payload.successfulIdentifier) {
            context.identify.successfulIdentifier =
              event.payload.successfulIdentifier;
          }
          return context;
        }),
        assignHasSyncablePassKey: assign((context, event) => {
          context.challenge.hasSyncablePassKey =
            event.payload.hasSyncablePassKey;
          return context;
        }),
        assignUserFound: assign((context, event) => {
          context.identify.userFound = event.payload.userFound;
          return context;
        }),
        assignAuthToken: assign((context, event) => {
          context.challenge.authToken = event.payload.authToken;
          return context;
        }),
        reset: assign(context => {
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
