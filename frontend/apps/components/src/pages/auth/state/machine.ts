import type { DeviceInfo } from '@onefootprint/idv';
import {
  getCanChallengeBiometrics,
  shouldChallengeEmail,
} from '@onefootprint/idv';
import type { ObConfigAuth, PublicOnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { IdentifiedEvent, MachineContext, MachineEvents } from './types';

export type AuthMachineArgs = {
  bootstrapData?: { email?: string; phoneNumber?: string };
  config: PublicOnboardingConfig;
  device: DeviceInfo;
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
  showLogo?: boolean;
};

export const hasBootstrapTruthyValue = (ctx: MachineContext): boolean =>
  Object.values(ctx.bootstrapData).some(Boolean);

export const getMachineArgs = ({
  bootstrapData,
  config,
  device,
  obConfigAuth,
  sandboxId,
  showLogo,
}: AuthMachineArgs): MachineContext =>
  obConfigAuth
    ? {
        bootstrapData: bootstrapData ?? {},
        challenge: {},
        config,
        device,
        identify: { sandboxId },
        obConfigAuth,
        showLogo,
      }
    : ({} as MachineContext);

const InitiateChallengeTransitions = [
  {
    target: 'emailChallenge',
    actions: ['assignIdentifySuccessResult'],
    description: 'Initiate a signup challenge for the email in no-phone flows',
    cond: (ctx: MachineContext, event: IdentifiedEvent) =>
      shouldChallengeEmail(
        !!ctx.config.isNoPhoneFlow,
        event.payload.availableChallengeKinds,
      ),
  },
  {
    target: 'biometricChallenge',
    actions: ['assignIdentifySuccessResult'],
    cond: (ctx: MachineContext, event: IdentifiedEvent) => {
      const { device } = ctx;
      const { availableChallengeKinds, hasSyncablePassKey } = event.payload;
      return !!getCanChallengeBiometrics(
        availableChallengeKinds,
        hasSyncablePassKey,
        device,
      );
    },
  },
  {
    target: 'smsChallenge',
    actions: ['assignIdentifySuccessResult'],
  },
];

const createAuthMachine = (args: AuthMachineArgs) =>
  createMachine(
    {
      id: 'auth',
      predictableActionArguments: true,
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0, // eslint-disable-line @typescript-eslint/consistent-type-imports
      initial: 'init',
      context: getMachineArgs(args),
      states: {
        init: {
          always: [
            {
              target: 'initBootstrap',
              cond: hasBootstrapTruthyValue,
            },
            { target: 'emailIdentification' },
          ],
        },
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
                cond: context => !!context.config.isNoPhoneFlow,
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
            identified: InitiateChallengeTransitions,
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
                cond: (context, event) =>
                  shouldChallengeEmail(
                    !!context.config.isNoPhoneFlow,
                    event.payload.availableChallengeKinds,
                  ),
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
                cond: (context, event) => {
                  const { device } = context;
                  const { availableChallengeKinds, hasSyncablePassKey } =
                    event.payload;
                  return !!getCanChallengeBiometrics(
                    availableChallengeKinds,
                    hasSyncablePassKey,
                    device,
                  );
                },
              },
              {
                target: 'smsChallenge',
                actions: ['assignIdentifySuccessResult'],
              },
            ],
            sandboxIdChanged: {
              actions: ['assignSandboxId'],
            },
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
            identified: InitiateChallengeTransitions,
          },
        },
        smsChallenge: {
          on: {
            challengeReceived: {
              actions: ['assignChallengeData'],
            },
            challengeSucceeded: {
              target: 'success',
              actions: ['assignAuthToken'],
            },
            identifyReset: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
            navigatedToPrevPage: [
              {
                target: 'biometricChallenge',
                cond: context => {
                  const {
                    device,
                    challenge: { availableChallengeKinds, hasSyncablePassKey },
                  } = context;
                  return !!getCanChallengeBiometrics(
                    availableChallengeKinds,
                    hasSyncablePassKey,
                    device,
                  );
                },
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
            challengeReceived: {
              actions: ['assignChallengeData'],
            },
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
            challengeReceived: {
              actions: ['assignChallengeData'],
            },
            challengeSucceeded: {
              target: 'success',
              actions: ['assignAuthToken'],
            },
            identifyReset: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
            navigatedToPrevPage: {
              target: 'emailIdentification',
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
          const isEmailChanged = email && context.identify.email !== email;
          if (isEmailChanged) {
            context.challenge.challengeData = undefined;
          }
          context.identify.email = email;
          return context;
        }),
        assignPhone: assign((context, event) => {
          const { phoneNumber } = event.payload;
          if (!phoneNumber) {
            return context;
          }
          const isPhoneChanged =
            phoneNumber && context.identify.phoneNumber !== phoneNumber;
          if (isPhoneChanged) {
            context.challenge.challengeData = undefined;
          }
          context.identify.phoneNumber = phoneNumber;
          return context;
        }),
        assignIdentifySuccessResult: assign((context, event) => {
          const {
            email,
            phoneNumber,
            userFound,
            isUnverified,
            availableChallengeKinds,
            successfulIdentifier,
            hasSyncablePassKey,
          } = event.payload;
          context.challenge.hasSyncablePassKey = hasSyncablePassKey;
          context.identify.userFound = userFound;
          context.identify.isUnverified = isUnverified;
          const isEmailChanged = email && context.identify.email !== email;
          const isPhoneChanged =
            phoneNumber && context.identify.phoneNumber !== phoneNumber;
          if (isEmailChanged || isPhoneChanged) {
            context.challenge.challengeData = undefined;
          }
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
        assignChallengeData: assign((context, event) => {
          context.challenge.challengeData = event.payload;
          return context;
        }),
        reset: assign(context => {
          // Don't allow resetting the identifier suffix
          context.identify = {
            sandboxId: context.identify.sandboxId,
          };
          context.bootstrapData = {};
          context.challenge = {};
          return context;
        }),
        assignSandboxId: assign((context, { payload }) => {
          const sandboxId = payload.sandboxId || context.identify.sandboxId;
          context.identify = { ...context.identify, sandboxId };
          return context;
        }),
      },
    },
  );

export default createAuthMachine;
