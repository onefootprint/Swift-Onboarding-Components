import { UserChallengeActionKind } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { assignDecryptedData, assignUpdateMethod, assignUserDashboard, assignVerifyToken } from './assigners';
import type { Typegen0 } from './machine.typegen';
import type { AuthMethodsMachineContext, AuthMethodsMachineEvents } from './types';

export type AuthMethodsMachineArgs = {
  authToken: string;
  initialMachineState?: Typegen0['matchesStates'];
};
const isTest = process.env.NODE_ENV === 'test';

const createAuthMethodsMachine = (args: AuthMethodsMachineArgs) =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOgJYDtd0BiAbQAYBdRUABwHtYjd78aQAPRARgCYA2bOWHluADgCcAZl4BWACy9u-ADQgAnol5T5gsUtkB2KbPISx-fgF8ratFjyESpbtSQgGTdCzbuuCPkERUUkZBSVVDUQxbmxTEX5jQ31tKRs7DBwCIgAhenp0WHQAJ2RaYgAjfMKSsoARZHRkAEl8ADdkABtcCAo3OkZmVnZ-eXNsKQlyfnMpbkn5RbVNBF5hIWD5ckM+MW202xB7LKc8gqLS8p6wfG8AM3UAMWRcTsg+9k8h31BR8cnprN5hJFvJllolPIhOZTFNDKZ+Np0kdMo5ctULmViNdbrgHs9Xu9XJ9Bt5hn5EGMxBMpjMxHMFksoghJrxsNxZIjZBJxGItntrIdjmj0GcapdsRAbvcni83r1eP0PKSfCNKf9aUDGWDmbwJEFkvNlHq+YtkcLsqKMbUrlLcfi5e8pEqvmSfpx1dSAXSGSCmStuBIjNg+bxFIlDNMpAcMg5LWLMbbpXjcO8qCSvKqKQgqTTAfTgaDwato4J4fJ4WJDHJjNxzaj49aJTj7qnesT3K6s79PXmfYX-VpuOIhGspDFZMoqYZ63HTk2sS2U+9FRnvmqcxr876i8zJ1CYnJyGJ6XDLLOcGAALZy5p21sAY0aPklybubY+nZV5J7qzDsV0KsTyMYQQWLSFqTWEFlFkTl9gvbBr1ve8UyfN1X3tD8OwGTMfw9P8pEMdktmMeRJBPKRi3EKRyGwEFeDkSYjGkWReAQpDXjvN9cDQl8l3fFcXW-d1-AYwjiP2MjzHpKiFCkEN+HkQJJmkHZBVjS8b04lD3141gMNbJ0hNwkSISU7ABCMGQg1NbhizEVi+yUwwtl4PkxHYrTOi4zC9PwYhYGQfAICqDg7wAYUwIKYF6dMvxMjc5FkeTFmSyRxCDPVIhWEFaPpRSYO4MjjxnIVUVoTBWDAHzH2ffT8GQNpcCgRpIAAFXoAAFYowDaTrkBgT8cPXbNuHIcSOX4HQGJBbkBGLfhZC9ScjAEailvkBCKqqmrULq-z+PUAAlOAwHQIblQS0bxqIybpr1eQ5uyxBI2pByOUMQx9TG8g9S2yr8GqnSeP2gzl1i4yRt-MaJs5e7ZokebmUDFzsDIo1PsIpRSo07BtsB3bdNB-isMht0Nxh264cUB6nqoywDxcjaiqkfhJH+nbgb8sGBIVMnu3wyn2WpmbHsR56AmPNkxhmbHyDGDk2LKhxYCvWBIq6N58BgYgHyizotZgE6HzAXA2jTfm8P8QMTGwRJAwrcxLDGiWfqhSNkimeRo2MMwENV9X9cNsBdaDm4YAAZVQB8TcgC213J7MDHkox9CK0w9mPKizFkIRdCmBiRE5dSURVtWNYN8OQ8Ok7YDOi6uytodkriZJIQz4QxGLEFqUAwxZeksjNuVnAA4r4PiAapqWvQdqup6vqBrABvhIp-gOQ2YRWM5CQvso5HeH7uITAkKZ9DZpSY1L0fy7D7WQ6n5rWogDrut6-rBuwy6ocFpbYlI3QOhqyJAlt9bALkZiBnGifNy-tb6ayrpPRqT9Z4v3nu-JepBVzxR-qJDkKc27p2PJ3bOiw4iAX1A5FyfAEIVBYFeM6xQeLj0QXrBB99jam3NhDBOAtrY6Dym5bG0Z5iLDssjbkUJvYKCmMeccojaH0MYcwu+Os2GV3vlHGOYA448JwYnaGf9wE6EARWAQ-d6ZVjRuNKB3BkiLR0Io+gDCSgqPYTrGup1zpxWGgY3+MRjGLCmmYkBVEZBEXGtyb6MwyJLScS4phD4WH31DtFMAySYAdQjmrFeV1DEBIAcE4BFiD4CCECfByQ9Axs3icopJqiH7IJnnPN+i9Bo+O-n462N1hbBNFnTZG68oSEUeskPYY1QS1NcfU9xjTp7P1fgvD+y8v6N1MgEIxhSgHmNdooeSw4lLaGrHsMYw9cYcU6BkkO6jg6cLNvHfRfCeAsTtjsEEX0LDr2mOBfBdFYkyB0AWeYnk5RXNSRoyO0dY5Sj0b4p5qxfmp3bsQrOuowxQjcuWJSRUprnhHohLyYLPF128ZbdZydW5p0eiiruuphCxCmrsVmCgLCyBBa8MFj9mloNacs3JuDm4EKpR3VFKwoJEUjNBPgojMU2EOPgegUp4DuGOLwpuCAAC0EstWb2CHq6VCFLRqvWYocC0ZqSLTGMIIZkgzT4sbOcG0xrEo8gsuIZIKkZCQJ1GKnQudtj4L1IjJaStzleUJiDPxazEqwS9HCUCiIRGGFIbEHkj1Fj7CxlfYU+MgbcT8s67Mn0LVVn4NsL6PJ6T7wDOYWIRoyLJGSHNNl+Kx4NMLdDIMETJj4LZpyPY1aeBjVzvY0QFb+lTMSVcjtgtpohiEYRHYRUzASHpkGOI8x179z2Z9dllz22PPVYGRyXJjxTXCYpQdf5YKjksFE6YVZdD+yhXAZVcL1VJTjdsBNqQ7FUUlWjGmUFuSsyVjYIAA */
      id: 'user',
      predictableActionArguments: true,
      schema: {
        context: {} as AuthMethodsMachineContext,
        events: {} as AuthMethodsMachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0, // eslint-disable-line @typescript-eslint/consistent-type-imports
      initial: args.initialMachineState || 'identify',
      context: {
        authToken: args.authToken,
        updateMethod: UserChallengeActionKind.addPrimary,
        userDashboard: {
          email: { status: 'empty' },
          phone: { status: 'empty' },
          passkey: { status: 'empty' },
        },
        verifyToken: isTest ? 'utok_INITIAL-TEST-MODE' : undefined,
      },
      on: {
        decryptUserDone: {
          actions: ['assignDecryptedData'],
        },
        updateUserDashboard: {
          target: 'dashboard',
          actions: ['assignUserDashboard'],
        },
      },
      states: {
        identify: {
          on: {
            setVerifyToken: {
              target: 'dashboard',
              actions: ['assignVerifyToken'],
            },
          },
        },
        dashboard: {
          on: {
            updateEmail: {
              target: 'updateEmail',
              actions: ['assignUpdateMethod'],
            },
            updatePhone: {
              target: 'updatePhone',
              actions: ['assignUpdateMethod'],
            },
            updatePasskey: {
              target: 'updatePasskey',
              actions: ['assignUpdateMethod'],
            },
          },
        },
        updateEmail: {
          on: {
            goToBack: { target: 'dashboard' },
          },
        },
        updatePhone: {
          on: {
            goToBack: { target: 'dashboard' },
          },
        },
        updatePasskey: {
          on: {
            goToBack: { target: 'dashboard' },
          },
        },
        notFoundChallenge: { type: 'final' },
        success: { type: 'final' },
      },
    },
    {
      actions: {
        assignUpdateMethod: assign(assignUpdateMethod),
        assignDecryptedData: assign(assignDecryptedData),
        assignUserDashboard: assign(assignUserDashboard),
        assignVerifyToken: assign(assignVerifyToken),
      },
    },
  );

export default createAuthMethodsMachine;
