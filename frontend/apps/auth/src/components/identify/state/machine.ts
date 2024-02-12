import type { DeviceInfo } from '@onefootprint/idv';
import type { ObConfigAuth, PublicOnboardingConfig } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import compose from 'lodash/fp/compose';
import { assign, createMachine } from 'xstate';

import { isEmail, isSms } from '@/src/utils';

import {
  hasBootstrapTruthyValue,
  hasEmailAndPhoneNumber,
  isNoPhoneFlow,
  isUserFoundWithSingleChallenge,
  shouldShowChallengeSelector,
} from './predicates';
import type {
  IdentifiedEvent,
  IdentifyMachineContext,
  IdentifyMachineEvents,
  IdentifyVariant,
  LogoConfig,
} from './types';

export type IdentifyMachineArgs = {
  initialAuthToken?: string;
  bootstrapData?: { email?: string; phoneNumber?: string };
  config?: PublicOnboardingConfig;
  isLive: boolean;
  device: DeviceInfo;
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
  /// When provided, will render the logo
  logoConfig?: LogoConfig;
  variant: IdentifyVariant;
};

type Ignore = unknown;
type KindPayload = { payload: ChallengeKind };
const getKindPayload = (_: Ignore, { payload }: KindPayload) => payload;
const isPayloadEmail = compose(isEmail, getKindPayload);
const isPayloadSms = compose(isSms, getKindPayload);

const CHALLENGE_SELECTION_TRANSITIONS = [
  // If there are multiple available challenge kinds OR there's only biometric OR the IdentifyVariant
  // always requires the challenge selector screen
  {
    cond: (c: IdentifyMachineContext, event: IdentifiedEvent) =>
      shouldShowChallengeSelector(c, event.payload.user),
    target: 'challengeSelectOrPasskey',
    actions: ['assignIdentifySuccessResult'],
  },
  // Otherwise, go directly to the SMS or phone screen
  {
    cond: (_: IdentifyMachineContext, event: IdentifiedEvent) =>
      isUserFoundWithSingleChallenge(event.payload.user, ChallengeKind.email),
    target: 'emailChallenge',
    actions: ['assignIdentifySuccessResult'],
  },
  {
    cond: (_: IdentifyMachineContext, event: IdentifiedEvent) =>
      isUserFoundWithSingleChallenge(event.payload.user, ChallengeKind.sms),
    target: 'smsChallenge',
    actions: ['assignIdentifySuccessResult'],
  },
];

/// The set of transitions used to return from the SMS or Email challenge screens
const BACK_FROM_CHALLENGE_TRANSITIONS = [
  // If we showed the challenge selector, return to it
  {
    cond: (c: IdentifyMachineContext) =>
      shouldShowChallengeSelector(c, c.identify.user),
    target: 'challengeSelectOrPasskey',
  },
  // If we didn't show the challenge selector screen, go back to the respective identification screen
  // If they were identified by email, go back to the email screen
  {
    cond: (c: IdentifyMachineContext) =>
      'email' in (c.identify.successfulIdentifier || {}),
    target: 'emailIdentification',
    actions: ['resetIdentifyState'],
  },
  // If the user had only one available challenge kind, go back to the phone input screen
  {
    cond: (c: IdentifyMachineContext) =>
      'phoneNumber' in (c.identify.successfulIdentifier || {}),
    target: 'phoneIdentification',
    actions: ['resetIdentifyState'],
  },
];

export const getMachineArgs = ({
  initialAuthToken,
  bootstrapData,
  config,
  isLive,
  device,
  obConfigAuth,
  sandboxId,
  logoConfig,
  variant,
}: IdentifyMachineArgs): IdentifyMachineContext => ({
  initialAuthToken,
  bootstrapData: bootstrapData ?? {},
  challenge: {},
  config,
  isLive,
  device,
  identify: {
    sandboxId: config?.isLive === false ? sandboxId : undefined,
  },
  obConfigAuth,
  logoConfig,
  variant,
});

// TODO these "back" transitions are super error prone. Would be much better to maintain a history
// of states
const createIdentifyMachine = (args: IdentifyMachineArgs) =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOgJYDtd0BiAbQAYBdRUABwHtYjd78aQAPRARgCYA2bOWHluADgCcAZl4BWACy9u-ADQgAnol5T5gsUtkB2KbPISx-fgF8ratFjyESpbtSQgGTdCzbuuCPkERUUkZBSVVDUQxbmxTEX5jQ31tKRs7DBwCIgAhenp0WHQAJ2RaYgAjfMKSsoARZHRkAEl8ADdkABtcCAo3OkZmVnZ-eXNsKQlyfnMpbkn5RbVNBF5hIWD5ckM+MW202xB7LKc8gqLS8p6wfG8AM3UAMWRcTsg+9k8h31BR8cnprN5hJFvJllolPIhOZTFNDKZ+Np0kdMo5ctULmViNdbrgHs9Xu9XJ9Bt5hn5EGMxBMpjMxHMFksoghJrxsNxZIjZBJxGItntrIdjmj0GcapdsRAbvcni83r1eP0PKSfCNKf9aUDGWDmbwJEFkvNlHq+YtkcLsqKMbUrlLcfi5e8pEqvmSfpx1dSAXSGSCmStuBIjNg+bxFIlDNMpAcMg5LWLMbbpXjcO8qCSvKqKQgqTTAfTgaDwato4J4fJ4WJDHJjNxzaj49aJTj7qnesT3K6s79PXmfYX-VpuOIhGspDFZMoqYZ63HTk2sS2U+9FRnvmqcxr876i8zJ1CYnJyGJ6XDLLOcGAALZy5p21sAY0aPklybubY+nZV5J7qzDsV0KsTyMYQQWLSFqTWEFlFkTl9gvbBr1ve8UyfN1X3tD8OwGTMfw9P8pEMdktmMeRJBPKRi3EKRyGwEFeDkSYjGkWReAQpDXjvN9cDQl8l3fFcXW-d1-AYwjiP2MjzHpKiFCkEN+HkQJJmkHZBVjS8b04lD3141gMNbJ0hNwkSISU7ABCMGQg1NbhizEVi+yUwwtl4PkxHYrTOi4zC9PwYhYGQfAICqDg7wAYUwIKYF6dMvxMjc5FkeTFmSyRxCDPVIhWEFaPpRSYO4MjjxnIVUVoTBWDAHzH2ffT8GQNpcCgRpIAAFXoAAFYowDaTrkBgT8cPXbNuHIcSOX4HQGJBbkBGLfhZC9ScjAEailvkBCKqqmrULq-z+PUAAlOAwHQIblQS0bxqIybpr1eQ5uyxBI2pByOUMQx9TG8g9S2yr8GqnSeP2gzl1i4yRt-MaJs5e7ZokebmUDFzsDIo1PsIpRSo07BtsB3bdNB-isMht0Nxh264cUB6nqoywDxcjaiqkfhJH+nbgb8sGBIVMnu3wyn2WpmbHsR56AmPNkxhmbHyDGDk2LKhxYCvWBIq6N58BgYgHyizotZgE6HzAXA2jTfm8P8QMTGwRJAwrcxLDGiWfqhSNkimeRo2MMwENV9X9cNsBdaDm4YAAZVQB8TcgC213J7MDHkox9CK0w9mPKizFkIRdCmBiRE5dSURVtWNYN8OQ8Ok7YDOi6uytodkriZJIQz4QxGLEFqUAwxZeksjNuVnAA4r4PiAapqWvQdqup6vqBrABvhIp-gOQ2YRWM5CQvso5HeH7uITAkKZ9DZpSY1L0fy7D7WQ6n5rWogDrut6-rBuwy6ocFpbYlI3QOhqyJAlt9bALkZiBnGifNy-tb6ayrpPRqT9Z4v3nu-JepBVzxR-qJDkKc27p2PJ3bOiw4iAX1A5FyfAEIVBYFeM6xQeLj0QXrBB99jam3NhDBOAtrY6Dym5bG0Z5iLDssjbkUJvYKCmMeccojaH0MYcwu+Os2GV3vlHGOYA448JwYnaGf9wE6EARWAQ-d6ZVjRuNKB3BkiLR0Io+gDCSgqPYTrGup1zpxWGgY3+MRjGLCmmYkBVEZBEXGtyb6MwyJLScS4phD4WH31DtFMAySYAdQjmrFeV1DEBIAcE4BFiD4CCECfByQ9Axs3icopJqiH7IJnnPN+i9Bo+O-n462N1hbBNFnTZG68oSEUeskPYY1QS1NcfU9xjTp7P1fgvD+y8v6N1MgEIxhSgHmNdooeSw4lLaGrHsMYw9cYcU6BkkO6jg6cLNvHfRfCeAsTtjsEEX0LDr2mOBfBdFYkyB0AWeYnk5RXNSRoyO0dY5Sj0b4p5qxfmp3bsQrOuowxQjcuWJSRUprnhHohLyYLPF128ZbdZydW5p0eiiruuphCxCmrsVmCgLCyBBa8MFj9mloNacs3JuDm4EKpR3VFKwoJEUjNBPgojMU2EOPgegUp4DuGOLwpuCAAC0EstWb2CHq6VCFLRqvWYocC0ZqSLTGMIIZkgzT4sbOcG0xrEo8gsuIZIKkZCQJ1GKnQudtj4L1IjJaStzleUJiDPxazEqwS9HCUCiIRGGFIbEHkj1Fj7CxlfYU+MgbcT8s67Mn0LVVn4NsL6PJ6T7wDOYWIRoyLJGSHNNl+Kx4NMLdDIMETJj4LZpyPY1aeBjVzvY0QFb+lTMSVcjtgtpohiEYRHYRUzASHpkGOI8x179z2Z9dllz22PPVYGRyXJjxTXCYpQdf5YKjksFE6YVZdD+yhXAZVcL1VJTjdsBNqQ7FUUlWjGmUFuSsyVjYIAA */
      id: 'auth',
      predictableActionArguments: true,
      schema: {
        context: {} as IdentifyMachineContext,
        events: {} as IdentifyMachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0, // eslint-disable-line @typescript-eslint/consistent-type-imports
      initial: 'init',
      context: getMachineArgs(args),
      states: {
        init: {
          always: [
            {
              target: 'initAuthToken',
              cond: context => !!context.initialAuthToken,
            },
            {
              cond: hasBootstrapTruthyValue,
              target: 'initBootstrap',
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
                cond: isNoPhoneFlow,
                target: 'emailChallenge',
                actions: ['assignEmail', 'assignPhone'],
              },
              {
                cond: (_, event) => hasEmailAndPhoneNumber(event.payload),
                target: 'smsChallenge',
                actions: ['assignEmail', 'assignPhone'],
              },
              {
                cond: (_, event) => !event.payload.email,
                target: 'emailIdentification',
                actions: ['assignPhone'],
              },
              {
                cond: (_, event) => !event.payload.phoneNumber,
                target: 'phoneIdentification',
                actions: ['assignEmail'],
              },
            ],
            identified: CHALLENGE_SELECTION_TRANSITIONS,
          },
        },
        initAuthToken: {
          on: {
            authTokenInvalid: {
              target: 'authTokenInvalid',
            },
            identified: CHALLENGE_SELECTION_TRANSITIONS,
          },
        },
        emailIdentification: {
          on: {
            identified: [
              // Login to existing vault with any available challenge method. If there is only
              // one available, go directly to that challenge
              ...CHALLENGE_SELECTION_TRANSITIONS,
              // If in a no-phone flow, create a new vault with only the email
              {
                cond: c => isNoPhoneFlow(c),
                target: 'emailChallenge',
                actions: ['assignIdentifySuccessResult'],
              },
              // Otherwise, proceed to see if we can find the user by phone
              {
                target: 'phoneIdentification',
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
              actions: ['resetPhone', 'resetIdentifyState'],
            },
            identifyReset: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
            identified: [
              // Login to existing vault with any available challenge method. If there is only
              // one available, go directly to that challenge
              ...CHALLENGE_SELECTION_TRANSITIONS,
              // Otherwise, initiate a signup challenge via SMS
              {
                target: 'smsChallenge',
                actions: ['assignIdentifySuccessResult'],
              },
            ],
          },
        },
        challengeSelectOrPasskey: {
          on: {
            navigatedToPrevPage: [
              // User was identified via email, so go back to the email page
              {
                cond: ctx =>
                  'email' in (ctx.identify.successfulIdentifier || {}),
                target: 'emailIdentification',
                actions: ['resetIdentifyState'],
              },
              {
                target: 'phoneIdentification',
                actions: ['resetIdentifyState'],
              },
            ],
            identifyReset: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
            goToChallenge: [
              { cond: isPayloadEmail, target: 'emailChallenge' },
              { cond: isPayloadSms, target: 'smsChallenge' },
            ],
            challengeSucceeded: {
              target: 'success',
              actions: ['assignAuthToken'],
            },
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
              ...BACK_FROM_CHALLENGE_TRANSITIONS,
              // Otherwise, we were making a new vault. Just go back to the phone input screen
              {
                target: 'phoneIdentification',
                actions: ['resetIdentifyState'],
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
            navigatedToPrevPage: [
              ...BACK_FROM_CHALLENGE_TRANSITIONS,
              // Otherwise, we were making a new vault. Just go back to the phone input screen
              {
                target: 'emailIdentification',
                actions: ['resetIdentifyState'],
              },
            ],
          },
        },
        authTokenInvalid: {
          type: 'final',
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
            // Only clear the challenge data if the email has changed, otherwise old data could still be valid
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
            // Only clear the challenge data if the phone has changed, otherwise old data could still be valid
            context.challenge.challengeData = undefined;
          }
          context.identify.phoneNumber = phoneNumber;
          return context;
        }),
        resetPhone: assign(context => {
          context.identify.phoneNumber = undefined;
          return context;
        }),
        resetIdentifyState: assign(context => {
          context.identify.successfulIdentifier = undefined;
          context.identify.user = undefined;
          return context;
        }),
        assignIdentifySuccessResult: assign((context, event) => {
          const { email, phoneNumber, user, successfulIdentifier } =
            event.payload;
          context.identify.user = user;
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

export default createIdentifyMachine;
