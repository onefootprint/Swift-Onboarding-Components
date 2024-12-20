import { isEmail as isEmailValid, isPhoneNumber } from '@onefootprint/core';
import { ChallengeKind as Kind } from '@onefootprint/types';
import compose from 'lodash/fp/compose';
import { assign, createMachine } from 'xstate';

import { isEmail, isPhone, isSms } from '../../../../../utils';
import type { LoginInitialArgs } from '../identify';
import type {
  ChallengeSucceededEvent,
  IdentifiedEvent,
  IdentifyMachineContext,
  IdentifyMachineEvents,
  NavigatedToPrevPage,
  TransitionsFor,
} from './types';
import { SuccessfulIdentifier } from './types';
import {
  getMachineArgs,
  hasSingleRequiredAuthMethod,
  isEmailAndPhoneValid,
  isEmailOrPhoneValid,
  isEmailVerificationRequired,
  isNoPhoneFlow,
  isPhoneVerificationRequired,
  isRequiredAuthMethodsPending,
  isUserFoundWithSingleChallenge,
  shouldShowChallengeSelector,
} from './utils';

const getKindPayload = (_: unknown, { payload }: { payload: Kind }) => payload;
const isPayloadEmail = compose(isEmail, getKindPayload);
const isPayloadSms = compose(isSms, getKindPayload);

const LOGIN_CHALLENGE_TRANSITIONS: TransitionsFor<IdentifiedEvent> = [
  // If there are multiple available challenge kinds OR there's only biometric OR the IdentifyVariant
  // always requires the challenge selector screen
  {
    cond: (ctx, ev) => shouldShowChallengeSelector(ctx, ev.payload.user),
    target: 'challengeSelectOrPasskey',
    actions: ['assignIdentifyResult'],
  },
  // Otherwise, go directly to the SMS or phone screen
  {
    cond: (ctx, ev) => isUserFoundWithSingleChallenge(Kind.email, ctx.device, ev.payload.user),
    target: 'emailChallenge',
    actions: ['assignIdentifyResult'],
  },
  {
    cond: (ctx, ev) => isUserFoundWithSingleChallenge(Kind.sms, ctx.device, ev.payload.user),
    target: 'smsChallenge',
    actions: ['assignIdentifyResult'],
  },
];

/// The set of transitions used to return from the SMS or Email challenge screens
const BACK_FROM_CHALLENGE_TRANSITIONS: TransitionsFor<NavigatedToPrevPage> = [
  // If we showed the challenge selector, return to it
  {
    cond: ctx => shouldShowChallengeSelector(ctx, ctx.identify.user),
    target: 'challengeSelectOrPasskey',
  },
  // If we didn't show the challenge selector screen, go back to the respective identification screen
  // If they were identified by email, go back to the email screen
  {
    cond: ctx => !!ctx.identify.successfulIdentifiers?.includes(SuccessfulIdentifier.email),
    target: 'emailIdentification',
    actions: ['resetIdentifyState'],
  },
  // If the user had only one available challenge kind, go back to the phone input screen
  {
    cond: ctx => !!ctx.identify.successfulIdentifiers?.includes(SuccessfulIdentifier.phone),
    target: 'phoneIdentification',
    actions: ['resetIdentifyState'],
  },
];

const SUCCESS_TRANSITIONS: TransitionsFor<ChallengeSucceededEvent> = [
  {
    cond: (ctx, ev) => isPhone(ev.payload.kind) && isRequiredAuthMethodsPending('email', ctx),
    target: 'addEmail',
    actions: ['assignAuthToken'],
    description: 'Register email as a login method when it is required by the playbook',
  },
  {
    cond: (ctx, ev) => !isPhone(ev.payload.kind) && isRequiredAuthMethodsPending('phone', ctx),
    target: 'addPhone',
    actions: ['assignAuthToken'],
    description: 'Register phone as a login method when it is required by the playbook',
  },
  {
    target: 'success',
    actions: ['assignAuthToken'],
  },
];

const createIdentifyMachine = (args: LoginInitialArgs) =>
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
        tryAnotherWay: [{ target: 'phoneKbaChallenge', cond: isPayloadEmail }],
        loginWithDifferentAccount: { target: 'emailIdentification', actions: ['resetToLoginWithNewAccount'] },
      },
      states: {
        init: {
          always: [
            { target: 'initAuthToken', cond: ctx => !!ctx.initialAuthToken },
            { target: 'initBootstrap', cond: isEmailOrPhoneValid },
            { target: 'emailIdentification', cond: ctx => !isEmailValid(ctx.email?.value || '') },
            { target: 'phoneIdentification' },
          ],
        },
        initBootstrap: {
          on: {
            bootstrapReceived: [
              ...LOGIN_CHALLENGE_TRANSITIONS,
              // Otherwise, go to respective signup challenge screens
              {
                target: 'emailChallenge',
                cond: ctx => isNoPhoneFlow(ctx) && isEmailValid(ctx.email?.value || ''),
              },
              {
                target: 'emailChallenge',
                cond: ctx => isEmailAndPhoneValid(ctx) && hasSingleRequiredAuthMethod('email', ctx),
              },
              { target: 'smsChallenge', cond: isEmailAndPhoneValid },
              { target: 'emailIdentification', cond: ctx => !isEmailValid(ctx.email?.value || '') },
              { target: 'phoneIdentification' },
            ],
          },
        },
        initAuthToken: {
          on: {
            identifyResult: [...LOGIN_CHALLENGE_TRANSITIONS, { target: 'loginChallengeNotPossible' }],
            authTokenInvalid: { target: 'authTokenInvalid' },
            identifiedWithSufficientScopes: [{ target: 'success', actions: ['assignAuthToken'] }],
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
                target: 'emailChallenge',
                cond: isNoPhoneFlow,
                actions: ['assignIdentifyResult'],
              },
              // Otherwise, proceed to see if we can find the user by phone
              { target: 'phoneIdentification', actions: ['assignIdentifyResult'] },
            ],
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
              {
                target: 'smsChallenge',
                cond: (ctx, { payload }) =>
                  isPhoneNumber(payload.phoneNumber || '') && isPhoneVerificationRequired(ctx),
                actions: ['assignIdentifyResult'],
              },
              {
                target: 'emailChallenge',
                cond: ctx => isEmailValid(ctx.email?.value || '') && isEmailVerificationRequired(ctx),
                actions: ['assignIdentifyResult'],
              },
              { target: 'smsChallenge', actions: ['assignIdentifyResult'] },
            ],
          },
        },
        phoneKbaChallenge: {
          on: {
            navigatedToPrevPage: [
              { target: 'smsChallenge', cond: (_ctx, ev) => ev.payload?.prev === 'smsChallenge' },
              { target: 'challengeSelectOrPasskey', cond: ctx => shouldShowChallengeSelector(ctx, ctx.identify.user) },
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
                target: 'emailIdentification',
                cond: ctx => !!ctx.identify?.successfulIdentifiers?.includes(SuccessfulIdentifier.email),
                actions: ['resetIdentifyState'],
              },
              {
                target: 'phoneIdentification',
                actions: ['resetIdentifyState'],
              },
            ],
            goToChallenge: [
              { target: 'emailChallenge', cond: isPayloadEmail },
              { target: 'smsChallenge', cond: isPayloadSms },
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
              { target: 'phoneIdentification', actions: ['resetIdentifyState'] },
            ],
          },
        },
        emailChallenge: {
          on: {
            challengeReceived: { actions: ['assignChallengeData'] },
            challengeSucceeded: SUCCESS_TRANSITIONS,
            navigatedToPrevPage: [
              ...BACK_FROM_CHALLENGE_TRANSITIONS,
              // Otherwise, we were making a new vault. Just go back to the email input screen
              { target: 'emailIdentification', actions: ['resetIdentifyState'] },
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
        addEmail: {
          on: {
            emailAdded: {
              target: 'success',
              actions: ['assignEmail'],
            },
          },
        },
        loginChallengeNotPossible: { type: 'final' },
        authTokenInvalid: { type: 'final' },
        success: { type: 'final' },
      },
    },
    {
      actions: {
        assignPhoneNumber: assign((context, { payload }) => {
          if (!payload) return context;

          const isPhoneChanged = payload && context.phoneNumber?.value !== payload;
          if (isPhoneChanged) {
            context.challenge.challengeData = undefined; // challengeData becomes invalid if the phone changes
          }

          context.phoneNumber = {
            value: payload,
            isBootstrap: false,
          };

          return context;
        }),
        assignEmail: assign((context, { payload }) => {
          if (!payload) return context;

          const isEmailChanged = payload && context.email?.value !== payload;
          if (isEmailChanged) {
            context.challenge.challengeData = undefined; // challengeData becomes invalid if the email changes
          }

          context.email = {
            value: payload,
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
      },
    },
  );

export default createIdentifyMachine;
