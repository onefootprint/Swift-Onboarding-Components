import type { ObConfigAuth, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';
import { ChallengeKind as Kind } from '@onefootprint/types';
import compose from 'lodash/fp/compose';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../hooks';
import { getRandomID, isEmail, isSms } from '../../../utils';
import validateBootstrapData from '../utils/validate-bootstrap-data';
import {
  isNoPhoneFlow,
  isPrevSmsChallenge,
  isUserFoundWithSingleChallenge,
  requiresPhoneVerification,
  shouldShowChallengeSelector,
} from './predicates';
import {
  type ChallengeSucceededEvent,
  type IdentifiedEvent,
  type IdentifyMachineContext,
  type IdentifyMachineEvents,
  type IdentifyVariant,
  type LogoConfig,
  type NavigatedToPrevPage,
  SuccessfulIdentifier,
  type TransitionsFor,
} from './types';

export type IdentifyMachineArgs = {
  initialAuthToken?: string;
  isComponentsSdk?: boolean;
  bootstrapData?: IdentifyBootstrapData;
  config?: PublicOnboardingConfig;
  isLive: boolean;
  device: DeviceInfo;
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
  overallOutcome?: OverallOutcome;
  /// When provided, will render the logo
  logoConfig?: LogoConfig;
  variant: IdentifyVariant;
};

export type IdentifyBootstrapData = { email?: string; phoneNumber?: string };

const getKindPayload = (_: unknown, { payload }: { payload: Kind }) => payload;
const isPayloadEmail = compose(isEmail, getKindPayload);
const isPayloadSms = compose(isSms, getKindPayload);

const LOGIN_CHALLENGE_TRANSITIONS: TransitionsFor<IdentifiedEvent> = [
  // If there are multiple available challenge kinds OR there's only biometric OR the IdentifyVariant
  // always requires the challenge selector screen
  {
    cond: (c, ev) => shouldShowChallengeSelector(c, ev.payload.user),
    target: 'challengeSelectOrPasskey',
    actions: ['assignIdentifyResult'],
  },
  // Otherwise, go directly to the SMS or phone screen
  {
    cond: (c, ev) => isUserFoundWithSingleChallenge(c.device, ev.payload.user, Kind.email),
    target: 'emailChallenge',
    actions: ['assignIdentifyResult'],
  },
  {
    cond: (c, ev) => isUserFoundWithSingleChallenge(c.device, ev.payload.user, Kind.sms),
    target: 'smsChallenge',
    actions: ['assignIdentifyResult'],
  },
];

/// The set of transitions used to return from the SMS or Email challenge screens
const BACK_FROM_CHALLENGE_TRANSITIONS: TransitionsFor<NavigatedToPrevPage> = [
  // If we showed the challenge selector, return to it
  {
    cond: c => shouldShowChallengeSelector(c, c.identify.user),
    target: 'challengeSelectOrPasskey',
  },
  // If we didn't show the challenge selector screen, go back to the respective identification screen
  // If they were identified by email, go back to the email screen
  {
    cond: c => !!c.identify.successfulIdentifiers?.includes(SuccessfulIdentifier.email),
    target: 'emailIdentification',
    actions: ['resetIdentifyState'],
  },
  // If the user had only one available challenge kind, go back to the phone input screen
  {
    cond: c => !!c.identify.successfulIdentifiers?.includes(SuccessfulIdentifier.phone),
    target: 'phoneIdentification',
    actions: ['resetIdentifyState'],
  },
];

const SUCCESS_TRANSITIONS: TransitionsFor<ChallengeSucceededEvent> = [
  {
    /** If the playbook requires phone and the user doesn't have a phone, add it */
    cond: (c, ev) => requiresPhoneVerification(c.config, c.identify.user, ev.payload.kind),
    target: 'addPhone',
    actions: ['assignAuthToken'],
    description: 'Register phone as a login method when it is required by the playbook',
  },
  {
    target: 'success',
    actions: ['assignAuthToken'],
  },
];

export const getMachineArgs = ({
  initialAuthToken,
  isComponentsSdk,
  bootstrapData,
  config,
  isLive,
  device,
  obConfigAuth,
  sandboxId,
  overallOutcome,
  logoConfig,
  variant,
}: IdentifyMachineArgs): IdentifyMachineContext => {
  const { email, phoneNumber } = validateBootstrapData(bootstrapData);
  return {
    initialAuthToken,
    isComponentsSdk: !!isComponentsSdk,
    bootstrapData: bootstrapData ?? {},
    challenge: {},
    config,
    isLive,
    device,
    sandboxId: config?.isLive === false && !initialAuthToken ? sandboxId || getRandomID(13) : undefined,
    email,
    phoneNumber,
    identify: {},
    overallOutcome,
    obConfigAuth,
    logoConfig,
    variant,
  };
};

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
      on: {
        tryAnotherWay: [{ cond: isPayloadEmail, target: 'phoneKbaChallenge' }],
        loginWithDifferentAccount: {
          target: 'emailIdentification',
          actions: ['resetToLoginWithNewAccount'],
        },
      },
      states: {
        init: {
          always: [
            {
              target: 'initAuthToken',
              cond: context => !!context.initialAuthToken,
            },
            {
              cond: ctx => !!ctx.email || !!ctx.phoneNumber,
              target: 'initBootstrap',
              description: 'If bootstrap phone or email is provided and valid, try to identify',
            },
            {
              cond: ctx => !ctx.email,
              target: 'emailIdentification',
            },
            {
              target: 'phoneIdentification',
            },
          ],
        },
        initBootstrap: {
          on: {
            bootstrapReceived: [
              ...LOGIN_CHALLENGE_TRANSITIONS,
              // Otherwise, go to respective signup challenge screens
              {
                cond: isNoPhoneFlow,
                target: 'emailChallenge',
              },
              {
                cond: ctx => !!ctx.phoneNumber && !!ctx.email,
                target: 'smsChallenge',
                description: 'If we didnt locate a user but have phone and email, go straight to SMS signup challenge',
              },
              {
                cond: ctx => !ctx.email,
                target: 'emailIdentification',
              },
              {
                target: 'phoneIdentification',
              },
            ],
          },
        },
        initAuthToken: {
          on: {
            authTokenInvalid: {
              target: 'authTokenInvalid',
            },
            identifiedWithSufficientScopes: [
              {
                target: 'success',
                actions: ['assignAuthToken'],
              },
            ],
            identifyResult: LOGIN_CHALLENGE_TRANSITIONS,
          },
        },
        emailIdentification: {
          on: {
            identifyResult: [
              // Login to existing vault with any available challenge method. If there is only
              // one available, go directly to that challenge
              ...LOGIN_CHALLENGE_TRANSITIONS,
              // If in a no-phone flow, go to signup challenge with only the email
              {
                cond: c => isNoPhoneFlow(c),
                target: 'emailChallenge',
                actions: ['assignIdentifyResult'],
              },
              // Otherwise, proceed to see if we can find the user by phone
              {
                target: 'phoneIdentification',
                actions: ['assignIdentifyResult'],
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
            identifyResult: [
              // Login to existing vault with any available challenge method. If there is only
              // one available, go directly to that challenge
              ...LOGIN_CHALLENGE_TRANSITIONS,
              // Otherwise, initiate a signup challenge via SMS
              {
                target: 'smsChallenge',
                actions: ['assignIdentifyResult'],
              },
            ],
          },
        },
        phoneKbaChallenge: {
          on: {
            navigatedToPrevPage: [
              { cond: isPrevSmsChallenge, target: 'smsChallenge' },
              {
                cond: c => shouldShowChallengeSelector(c, c.identify.user),
                target: 'challengeSelectOrPasskey',
              },
              { target: 'emailIdentification' },
            ],
            kbaSucceeded: {
              target: 'emailChallenge',
              actions: ['assignIdentifyToken'],
            },
          },
        },
        challengeSelectOrPasskey: {
          on: {
            navigatedToPrevPage: [
              // User was identified via email, so go back to the email page
              {
                cond: c => !!c.identify?.successfulIdentifiers?.includes(SuccessfulIdentifier.email),
                target: 'emailIdentification',
                actions: ['resetIdentifyState'],
              },
              {
                target: 'phoneIdentification',
                actions: ['resetIdentifyState'],
              },
            ],
            goToChallenge: [
              { cond: isPayloadEmail, target: 'emailChallenge' },
              { cond: isPayloadSms, target: 'smsChallenge' },
            ],
            challengeSucceeded: SUCCESS_TRANSITIONS,
          },
        },
        smsChallenge: {
          on: {
            challengeReceived: {
              actions: ['assignChallengeData'],
            },
            challengeSucceeded: SUCCESS_TRANSITIONS,
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
            challengeSucceeded: SUCCESS_TRANSITIONS,
            navigatedToPrevPage: [
              ...BACK_FROM_CHALLENGE_TRANSITIONS,
              // Otherwise, we were making a new vault. Just go back to the email input screen
              {
                target: 'emailIdentification',
                actions: ['resetIdentifyState'],
              },
            ],
          },
        },
        addPhone: {
          on: {
            phoneAdded: {
              target: 'success',
              actions: ['assignPhoneNumber'],
            },
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
        assignPhoneNumber: assign((context, event) => {
          const { phoneNumber } = event.payload;
          if (!phoneNumber) {
            return context;
          }
          const isPhoneChanged = phoneNumber && context.phoneNumber?.value !== phoneNumber;
          if (isPhoneChanged) {
            // challengeData becomes invalid if the phone changes
            context.challenge.challengeData = undefined;
          }
          context.phoneNumber = {
            value: phoneNumber,
            isBootstrap: false,
          };
          return context;
        }),
        resetPhone: assign(context => {
          context.phoneNumber = undefined;
          return context;
        }),
        resetIdentifyState: assign(context => {
          context.identify = {};
          return context;
        }),
        assignIdentifyResult: assign((context, event) => {
          // After we have made a request to POST /hosted/identify with a new phone or email,
          // save the results from the identify API and any new phone/email
          const { email, phoneNumber, ...restOfPayload } = event.payload;

          context.identify = restOfPayload;
          if (restOfPayload.user) {
            // The "identifyToken" may be overwritten by the KBA challenge, so need to pull it out
            context.identify.identifyToken = restOfPayload.user.token;
          }

          // challengeData becomes invalid if the phone or email changes
          const isEmailChanged = email && context.email?.value !== email;
          const isPhoneChanged = phoneNumber && context.phoneNumber?.value !== phoneNumber;
          if (isEmailChanged || isPhoneChanged) {
            context.challenge.challengeData = undefined;
          }

          if (email) {
            context.email = {
              value: email,
              isBootstrap: false,
            };
          }
          if (phoneNumber) {
            context.phoneNumber = {
              value: phoneNumber,
              isBootstrap: false,
            };
          }

          return context;
        }),
        assignAuthToken: assign((context, event) => {
          context.challenge.authToken = event.payload.authToken;
          return context;
        }),
        assignIdentifyToken: assign((context, event) => {
          context.identify.identifyToken = event.payload.identifyToken;
          return context;
        }),
        assignChallengeData: assign((context, event) => {
          context.challenge.challengeData = event.payload;
          return context;
        }),
        resetToLoginWithNewAccount: assign(context => {
          context.phoneNumber = undefined;
          context.email = undefined;
          context.identify = {};
          context.bootstrapData = {};
          context.challenge = {};
          return context;
        }),
        assignSandboxId: assign((context, { payload }) => {
          context.sandboxId = payload.sandboxId || context.sandboxId;
          return context;
        }),
      },
    },
  );

export default createIdentifyMachine;
