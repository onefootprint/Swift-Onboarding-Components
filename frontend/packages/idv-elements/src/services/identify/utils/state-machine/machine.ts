import { IdentifyBootstrapData, ObConfigAuth } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { getCanChallengeBiometrics } from '../biometrics';
import { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';
import shouldBootstrap from './utils/should-bootstrap';
import shouldSelectSandboxOutcome from './utils/should-select-sandbox-outcome';

export type IdentifyMachineArgs = {
  bootstrapData?: IdentifyBootstrapData;
  obConfigAuth: ObConfigAuth;
  showLogo?: boolean;
};

const createIdentifyMachine = ({
  bootstrapData,
  obConfigAuth,
  showLogo,
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
      initial: 'init',
      context: {
        obConfigAuth,
        bootstrapData: bootstrapData ?? {},
        identify: {},
        challenge: {},
        showLogo,
      },
      states: {
        init: {
          on: {
            configRequestFailed: {
              target: 'configInvalid',
            },
            initContextUpdated: [
              {
                target: 'initialized',
                actions: ['assignInitContext'],
                cond: (context, event) => isContextReady(context, event),
              },
              {
                target: 'init',
                actions: ['assignInitContext'],
              },
            ],
          },
        },
        initialized: {
          always: [
            {
              target: 'sandboxOutcome',
              cond: shouldSelectSandboxOutcome,
            },
            {
              target: 'initBootstrap',
              cond: shouldBootstrap,
            },
            {
              target: 'emailIdentification',
            },
          ],
        },
        sandboxOutcome: {
          on: {
            sandboxOutcomeSubmitted: [
              {
                target: 'initBootstrap',
                actions: ['assignSandboxOutcome'],
                cond: shouldBootstrap,
              },
              {
                target: 'emailIdentification',
                actions: ['assignSandboxOutcome'],
              },
            ],
          },
        },
        // New bootstrap transitions (not used in this machine for now)
        initBootstrap: {
          on: {
            bootstrapDataInvalid: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
            identifyFailed: [
              {
                target: 'emailChallenge',
                actions: ['assignEmail', 'assignPhone'],
                description:
                  'Initiate a signup challenge for the email in no-phone flows',
                cond: context => !!context.config?.isNoPhoneFlow,
              },
              {
                target: 'smsChallenge',
                actions: ['assignEmail', 'assignPhone'],
                description:
                  'Initiate a signup challenge for the phone number even if we could not identify the user',
                cond: (context, event) =>
                  !!event.payload.email && !!event.payload.phoneNumber,
              },
              {
                target: 'emailIdentification',
                actions: ['assignPhone'],
                description: 'We need to collect email always',
                cond: (context, event) => !event.payload.email,
              },
              {
                target: 'phoneIdentification',
                actions: ['assignEmail'],
                description:
                  'There is an email, but we need to collect phone always',
                cond: (context, event) => !event.payload.phoneNumber,
              },
            ],
            identified: [
              {
                target: 'emailChallenge',
                actions: ['assignIdentifySuccessResult'],
                description:
                  'Initiate a signup challenge for the email in no-phone flows',
                cond: context => !!context.config?.isNoPhoneFlow,
              },
              {
                target: 'biometricChallenge',
                actions: ['assignIdentifySuccessResult'],
                cond: (context, event) =>
                  !!getCanChallengeBiometrics(
                    {
                      hasSyncablePassKey: event.payload.hasSyncablePassKey,
                      availableChallengeKinds:
                        event.payload.availableChallengeKinds,
                    },
                    context.device,
                  ),
              },
              {
                target: 'smsChallenge',
                actions: ['assignIdentifySuccessResult'],
              },
            ],
          },
        },
        emailIdentification: {
          on: {
            identified: [
              {
                target: 'emailChallenge',
                actions: ['assignIdentifySuccessResult'],
                description:
                  'Do not collect phone number and just initiate email OTP',
                cond: context => !!context.config?.isNoPhoneFlow,
              },
              {
                target: 'phoneIdentification',
                actions: ['assignIdentifySuccessResult'],
                description:
                  'Transition to phone registration only if could not find user or will not be able to initiate a challenge',
                cond: (context, event) =>
                  !event.payload.userFound ||
                  !event.payload.availableChallengeKinds ||
                  event.payload.availableChallengeKinds.length === 0,
              },
              {
                target: 'biometricChallenge',
                actions: ['assignIdentifySuccessResult'],
                cond: (context, event) =>
                  !!getCanChallengeBiometrics(
                    {
                      hasSyncablePassKey: event.payload.hasSyncablePassKey,
                      availableChallengeKinds:
                        event.payload.availableChallengeKinds,
                    },
                    context.device,
                  ),
              },
              {
                target: 'smsChallenge',
                actions: ['assignIdentifySuccessResult'],
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
            identified: [
              {
                target: 'biometricChallenge',
                actions: ['assignIdentifySuccessResult'],
                cond: (context, event) =>
                  !!getCanChallengeBiometrics(
                    {
                      hasSyncablePassKey: event.payload.hasSyncablePassKey,
                      availableChallengeKinds:
                        event.payload.availableChallengeKinds,
                    },
                    context.device,
                  ),
              },
              {
                target: 'smsChallenge',
                actions: ['assignIdentifySuccessResult'],
              },
            ],
          },
        },
        smsChallenge: {
          on: {
            challengeSucceeded: {
              target: 'success',
              actions: ['assignAuthToken'],
            },
            navigatedToPrevPage: [
              {
                target: 'biometricChallenge',
                cond: context =>
                  !!getCanChallengeBiometrics(
                    context.challenge,
                    context.device,
                  ),
              },
              {
                target: 'phoneIdentification',
                cond: context =>
                  !context.identify.userFound || !!context.identify.phoneNumber,
              },
              {
                target: 'emailIdentification',
              },
            ],
          },
        },
        biometricChallenge: {
          on: {
            challengeSucceeded: {
              target: 'success',
              actions: ['assignAuthToken'],
            },
            identifyReset: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
            changeChallengeToSms: {
              target: 'smsChallenge',
            },
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
          },
        },
        emailChallenge: {
          on: {
            challengeSucceeded: {
              target: 'success',
              actions: ['assignAuthToken'],
            },
            navigatedToPrevPage: {
              target: 'emailIdentification',
            },
          },
        },
        configInvalid: {
          type: 'final',
        },
        success: {
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
        assignSandboxOutcome: assign((context, event) => {
          context.identify.sandboxId = event.payload.sandboxId;
          context.idDocOutcome = event.payload.idDocOutcome;
          return context;
        }),
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
        assignIdentifySuccessResult: assign((context, event) => {
          const {
            email,
            phoneNumber,
            userFound,
            availableChallengeKinds,
            successfulIdentifier,
            hasSyncablePassKey,
          } = event.payload;
          context.challenge.hasSyncablePassKey = hasSyncablePassKey;
          context.identify.userFound = userFound;
          if (email) {
            context.identify.email = email;
          }
          if (phoneNumber) {
            context.identify.phoneNumber = phoneNumber;
          }
          if (availableChallengeKinds) {
            context.challenge.availableChallengeKinds = availableChallengeKinds;
          }
          if (successfulIdentifier) {
            context.identify.successfulIdentifier = successfulIdentifier;
          }
          return context;
        }),
        assignAuthToken: assign((context, event) => {
          context.challenge.authToken = event.payload.authToken;
          return context;
        }),
        reset: assign(context => {
          // Don't allow resetting the identifier suffix
          context.identify = {
            sandboxId: context.identify.sandboxId,
          };
          context.challenge = {};
          return context;
        }),
      },
    },
  );

export default createIdentifyMachine;
