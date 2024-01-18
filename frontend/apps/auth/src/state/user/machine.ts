import type { IdentifyResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import compose from 'lodash/fp/compose';
import { assign, createMachine } from 'xstate';

import type { UserMachineContext, UserMachineEvents } from './types';

type Ignore = unknown;
type KindPayload = { payload: ChallengeKind };
type IdentifyPayload = { payload: IdentifyResponse };
export type UserMachineArgs = { authToken: string };

const { sms, email, biometric } = ChallengeKind;
const isSms = (x: unknown): x is ChallengeKind.sms => x === sms;
const isEmail = (x: unknown): x is ChallengeKind.email => x === email;
const isPasskey = (x: unknown): x is ChallengeKind.biometric => x === biometric;
const hasVerifyToken = (ctx: UserMachineContext) => Boolean(ctx.verifyToken);

const getKindPayload = (_: Ignore, { payload }: KindPayload) => payload;
const isPayloadEmail = compose(isEmail, getKindPayload);
const isPayloadSms = compose(isSms, getKindPayload);
const isPayloadPasskey = compose(isPasskey, getKindPayload);
const asterisksToBullet = (str?: string): string =>
  (str || '').replace(/\*/g, '•');

const isNotEmptyArray = (x: unknown): boolean =>
  Array.isArray(x) && x.length > 0;

const userOrChallengesNotFound = (_: Ignore, { payload }: IdentifyPayload) =>
  !payload.userFound || !isNotEmptyArray(payload.availableChallengeKinds);

const createUserMachine = (args: UserMachineArgs) =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOgJYDtd0BiAbQAYBdRUABwHtYjd78aQAPRARgCYA2bOWHluADgCcAZl4BWACy9u-ADQgAnol5T5gsUtkB2KbPISx-fgF8ratFjyESpbtSQgGTdCzbuuCPkERUUkZBSVVDUQxbmxTEX5jQ31tKRs7DBwCIgAhenp0WHQAJ2RaYgAjfMKSsoARZHRkAEl8ADdkABtcCAo3OkZmVnZ-eXNsKQlyfnMpbkn5RbVNBF5hIWD5ckM+MW202xB7LKc8gqLS8p6wfG8AM3UAMWRcTsg+9k8h31BR8cnprN5hJFvJllolPIhOZTFNDKZ+Np0kdMo5ctULmViNdbrgHs9Xu9XJ9Bt5hn5EGMxBMpjMxHMFksoghJrxsNxZIjZBJxGItntrIdjmj0GcapdsRAbvcni83r1eP0PKSfCNKf9aUDGWDmbwJEFkvNlHq+YtkcLsqKMbUrlLcfi5e8pEqvmSfpx1dSAXSGSCmStuBIjNg+bxFIlDNMpAcMg5LWLMbbpXjcO8qCSvKqKQgqTTAfTgaDwato4J4fJ4WJDHJjNxzaj49aJTj7qnesT3K6s79PXmfYX-VpuOIhGspDFZMoqYZ63HTk2sS2U+9FRnvmqcxr876i8zJ1CYnJyGJ6XDLLOcGAALZy5p21sAY0aPklybubY+nZV5J7qzDsV0KsTyMYQQWLSFqTWEFlFkTl9gvbBr1ve8UyfN1X3tD8OwGTMfw9P8pEMdktmMeRJBPKRi3EKRyGwEFeDkSYjGkWReAQpDXjvN9cDQl8l3fFcXW-d1-AYwjiP2MjzHpKiFCkEN+HkQJJmkHZBVjS8b04lD3141gMNbJ0hNwkSISU7ABCMGQg1NbhizEVi+yUwwtl4PkxHYrTOi4zC9PwYhYGQfAICqDg7wAYUwIKYF6dMvxMjc5FkeTFmSyRxCDPVIhWEFaPpRSYO4MjjxnIVUVoTBWDAHzH2ffT8GQNpcCgRpIAAFXoAAFYowDaTrkBgT8cPXbNuHIcSOX4HQGJBbkBGLfhZC9ScjAEailvkBCKqqmrULq-z+PUAAlOAwHQIblQS0bxqIybpr1eQ5uyxBI2pByOUMQx9TG8g9S2yr8GqnSeP2gzl1i4yRt-MaJs5e7ZokebmUDFzsDIo1PsIpRSo07BtsB3bdNB-isMht0Nxh264cUB6nqoywDxcjaiqkfhJH+nbgb8sGBIVMnu3wyn2WpmbHsR56AmPNkxhmbHyDGDk2LKhxYCvWBIq6N58BgYgHyizotZgE6HzAXA2jTfm8P8QMTGwRJAwrcxLDGiWfqhSNkimeRo2MMwENV9X9cNsBdaDm4YAAZVQB8TcgC213J7MDHkox9CK0w9mPKizFkIRdCmBiRE5dSURVtWNYN8OQ8Ok7YDOi6uytodkriZJIQz4QxGLEFqUAwxZeksjNuVnAA4r4PiAapqWvQdqup6vqBrABvhIp-gOQ2YRWM5CQvso5HeH7uITAkKZ9DZpSY1L0fy7D7WQ6n5rWogDrut6-rBuwy6ocFpbYlI3QOhqyJAlt9bALkZiBnGifNy-tb6ayrpPRqT9Z4v3nu-JepBVzxR-qJDkKc27p2PJ3bOiw4iAX1A5FyfAEIVBYFeM6xQeLj0QXrBB99jam3NhDBOAtrY6Dym5bG0Z5iLDssjbkUJvYKCmMeccojaH0MYcwu+Os2GV3vlHGOYA448JwYnaGf9wE6EARWAQ-d6ZVjRuNKB3BkiLR0Io+gDCSgqPYTrGup1zpxWGgY3+MRjGLCmmYkBVEZBEXGtyb6MwyJLScS4phD4WH31DtFMAySYAdQjmrFeV1DEBIAcE4BFiD4CCECfByQ9Axs3icopJqiH7IJnnPN+i9Bo+O-n462N1hbBNFnTZG68oSEUeskPYY1QS1NcfU9xjTp7P1fgvD+y8v6N1MgEIxhSgHmNdooeSw4lLaGrHsMYw9cYcU6BkkO6jg6cLNvHfRfCeAsTtjsEEX0LDr2mOBfBdFYkyB0AWeYnk5RXNSRoyO0dY5Sj0b4p5qxfmp3bsQrOuowxQjcuWJSRUprnhHohLyYLPF128ZbdZydW5p0eiiruuphCxCmrsVmCgLCyBBa8MFj9mloNacs3JuDm4EKpR3VFKwoJEUjNBPgojMU2EOPgegUp4DuGOLwpuCAAC0EstWb2CHq6VCFLRqvWYocC0ZqSLTGMIIZkgzT4sbOcG0xrEo8gsuIZIKkZCQJ1GKnQudtj4L1IjJaStzleUJiDPxazEqwS9HCUCiIRGGFIbEHkj1Fj7CxlfYU+MgbcT8s67Mn0LVVn4NsL6PJ6T7wDOYWIRoyLJGSHNNl+Kx4NMLdDIMETJj4LZpyPY1aeBjVzvY0QFb+lTMSVcjtgtpohiEYRHYRUzASHpkGOI8x179z2Z9dllz22PPVYGRyXJjxTXCYpQdf5YKjksFE6YVZdD+yhXAZVcL1VJTjdsBNqQ7FUUlWjGmUFuSsyVjYIAA */
      id: 'user',
      predictableActionArguments: true,
      schema: {
        context: {} as UserMachineContext,
        events: {} as UserMachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0, // eslint-disable-line @typescript-eslint/consistent-type-imports
      initial: 'init',
      context: {
        authToken: args.authToken,
        email: undefined,
        emailChallenge: undefined,
        emailReplaceChallenge: undefined,
        kindToChallenge: undefined,
        passkeyChallenge: undefined,
        passkeyReplaceChallenge: undefined, // Feature in Progress
        phoneChallenge: undefined,
        phoneNumber: undefined,
        phoneReplaceChallenge: undefined,
        userDashboard: {
          email: { status: 'empty' },
          phone: { status: 'empty' },
          passkey: { status: 'empty' },
        },
        userFound: undefined,
        verifyToken: undefined,
      },
      states: {
        init: {
          always: [
            { cond: hasVerifyToken, target: 'dashboard' },
            { target: 'identifyUser' },
          ],
        },
        identifyUser: {
          on: {
            identifyUserFailed: { target: 'notFoundUser' },
            identifyUserDone: [
              { cond: userOrChallengesNotFound, target: 'notFoundChallenge' },
              { target: 'userFound', actions: ['assignUserFound'] },
            ],
          },
        },
        userFound: {
          on: {
            goToChallenge: [
              { cond: isPayloadEmail, target: 'emailChallenge' },
              { cond: isPayloadSms, target: 'phoneChallenge' },
              { cond: isPayloadPasskey, target: 'passkeyChallenge' },
            ],
            setChallengeKind: { actions: ['assignKindToChallenge'] },
          },
        },
        emailChallenge: {
          on: {
            goToBack: { target: 'userFound' },
            setEmailChallenge: { actions: ['assignEmailChallenge'] },
            setVerifyToken: {
              target: 'dashboard',
              actions: ['assignVerifyToken'],
            },
          },
        },
        phoneChallenge: {
          on: {
            goToBack: { target: 'userFound' },
            setPhoneChallenge: { actions: ['assignPhoneChallenge'] },
            setVerifyToken: {
              target: 'dashboard',
              actions: ['assignVerifyToken'],
            },
          },
        },
        passkeyChallenge: {
          on: {
            goToBack: { target: 'userFound' },
            goToChallenge: {
              cond: isPayloadSms,
              target: 'phoneChallenge',
              actions: ['assignKindToChallenge'],
            },
            setPasskeyChallenge: { actions: ['assignPasskeyChallenge'] },
            setVerifyToken: {
              target: 'dashboard',
              actions: ['assignVerifyToken'],
            },
          },
        },
        dashboard: {
          on: {
            updateEmail: { target: 'updateEmail' },
            updatePhone: { target: 'updatePhone' },
            updatePasskey: { target: 'updatePasskey' },
          },
        },
        updateEmail: {
          on: {
            goToBack: { target: 'dashboard' },
            setEmail: {
              target: 'updateEmailVerify',
              actions: ['assignEmail'],
            },
          },
        },
        updateEmailVerify: {
          on: {
            goToBack: { target: 'dashboard' },
            updateUserDashboard: {
              target: 'dashboard',
              actions: ['assignUserDashboard'],
            },
            setEmailReplaceChallenge: {
              actions: ['assignEmailReplaceChallenge'],
            },
          },
        },
        updatePhone: {
          on: {
            goToBack: { target: 'dashboard' },
            setPhoneNumber: {
              target: 'updatePhoneVerify',
              actions: ['assignPhoneNumber'],
            },
          },
        },
        updatePhoneVerify: {
          on: {
            goToBack: { target: 'dashboard' },
            updateUserDashboard: {
              target: 'dashboard',
              actions: ['assignUserDashboard'],
            },
            setSmsReplaceChallenge: {
              actions: ['assignPhoneReplaceChallenge'],
            },
          },
        },
        updatePasskey: {
          on: {
            goToBack: { target: 'dashboard' },
          },
        },
        notFoundChallenge: { type: 'final' },
        notFoundUser: { type: 'final' },
        success: { type: 'final' },
      },
    },
    {
      actions: {
        assignEmail: assign((ctx, { payload }) => {
          ctx.email = payload;
          return ctx;
        }),
        assignEmailChallenge: assign((ctx, { payload }) => {
          ctx.emailChallenge = payload;
          return ctx;
        }),
        assignEmailReplaceChallenge: assign((ctx, { payload }) => {
          ctx.emailReplaceChallenge = payload;
          return ctx;
        }),
        assignKindToChallenge: assign((ctx, { payload }) => {
          ctx.kindToChallenge = payload;
          return ctx;
        }),
        assignPasskeyChallenge: assign((ctx, { payload }) => {
          ctx.passkeyChallenge = payload;
          return ctx;
        }),
        // assignPasskeyReplaceChallenge: assign((ctx, { payload }) => {
        //   ctx.passkeyReplaceChallenge = payload;
        //   return ctx;
        // }),
        assignPhoneChallenge: assign((ctx, { payload }) => {
          if (ctx.userDashboard.phone) {
            ctx.userDashboard = {
              ...ctx.userDashboard,
              phone: {
                ...ctx.userDashboard.phone,
                label: payload.scrubbedPhoneNumber,
              },
            };
          }

          ctx.phoneChallenge = payload;
          return ctx;
        }),
        assignPhoneNumber: assign((ctx, { payload }) => {
          ctx.phoneNumber = payload;
          return ctx;
        }),
        assignPhoneReplaceChallenge: assign((ctx, { payload }) => {
          ctx.phoneReplaceChallenge = payload;
          return ctx;
        }),
        assignUserFound: assign((ctx, { payload }) => {
          const dashboard = { ...ctx.userDashboard };
          const kinds = payload.availableChallengeKinds;
          const scrubbedEmail = asterisksToBullet(payload.scrubbedEmail);
          const scrubbedPhone = asterisksToBullet(payload.scrubbedPhone);

          if (kinds?.some(isSms)) {
            dashboard.phone = { status: 'set', label: scrubbedPhone };
          }
          if (kinds?.some(isEmail)) {
            dashboard.email = { status: 'set', label: scrubbedEmail };
          }
          if (kinds?.some(isPasskey)) {
            dashboard.passkey = { ...dashboard.passkey, status: 'set' };
          }

          ctx.kindToChallenge = kinds?.at(0);
          ctx.userDashboard = dashboard;
          ctx.userFound = { ...payload, scrubbedEmail, scrubbedPhone };

          return ctx;
        }),
        assignVerifyToken: assign((ctx, { payload }) => {
          const { token, kind } = payload;
          const userDashboard = {
            ...ctx.userDashboard,
            [kind]: {
              ...ctx.userDashboard[kind],
              status: 'verified',
            },
          };

          ctx.userDashboard = userDashboard;
          ctx.verifyToken = token; // The last one overrides the previous
          return ctx;
        }),
        assignUserDashboard: assign((ctx, { payload }) => {
          const { entry, kind } = payload;
          ctx.userDashboard = {
            ...ctx.userDashboard,
            [kind]: {
              ...ctx.userDashboard[kind],
              ...entry,
            },
          };
          return ctx;
        }),
      },
    },
  );

export default createUserMachine;
