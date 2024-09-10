import { assign, createMachine } from 'xstate';

import type { AuthIdentifyAppMachineArgs, AuthIdentifyAppMachineContext, AuthIdentifyAppMachineEvents } from './types';

const createAuthIdentifyAppMachine = (_args: AuthIdentifyAppMachineArgs) =>
  createMachine(
    {
      id: 'auth-identify-app',
      predictableActionArguments: true,
      schema: {
        context: {} as AuthIdentifyAppMachineContext,
        events: {} as AuthIdentifyAppMachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0, // eslint-disable-line @typescript-eslint/consistent-type-imports
      initial: 'init',
      context: {},
      on: {
        deviceReceived: { actions: ['assignDevice'] },
        scopedAuthTokenReceived: { actions: ['assignScopedAuthToken'] },
        invalidAuthConfigReceived: { target: 'invalidAuthConfig' },
        invalidConfigReceived: { target: 'invalidConfig' },
        sdkUrlNotAllowedReceived: { target: 'sdkUrlNotAllowed' },
      },
      states: {
        init: {
          on: {
            authPropsReceived: [
              {
                target: 'identify',
                actions: ['assignProps'],
              },
            ],
          },
        },
        identify: {
          on: {
            identifyCompletedPasskeyAlreadyRegistered: [{ target: 'done' }],
            identifyCompleted: [
              {
                cond: ctx => !!ctx.device?.hasSupportForWebauthn,
                target: 'passkeyOptionalRegistration',
                actions: ['assignAuthToken'],
              },
              { target: 'done' },
            ],
          },
        },
        passkeyOptionalRegistration: {
          on: {
            passkeyRegistrationError: [{ target: 'passkeyError' }],
            passkeyRegistrationTabOpened: [
              {
                target: 'passkeyProcessing',
                actions: ['assignPasskeyRegistrationWindow'],
              },
            ],
          },
        },
        passkeyProcessing: {
          on: {
            passkeyProcessingCancelled: [{ target: 'passkeyCancelled' }],
            passkeyProcessingCompleted: [{ target: 'passkeySuccess' }],
            passkeyProcessingError: [{ target: 'passkeyError' }],
          },
        },
        done: { type: 'final' },
        invalidAuthConfig: { type: 'final' },
        invalidConfig: { type: 'final' },
        passkeyCancelled: { type: 'final' },
        passkeyError: { type: 'final' },
        passkeySuccess: { type: 'final' },
        sdkUrlNotAllowed: { type: 'final' },
      },
    },
    {
      actions: {
        assignProps: assign((ctx, { payload }) => {
          if (!payload) return ctx;

          ctx.config = payload.config ? { ...payload.config } : ctx.config;
          ctx.props = payload.props ? { ...payload.props } : ctx.props;
          return ctx;
        }),
        assignDevice: assign((ctx, { payload }) => {
          if (!payload) return ctx;
          ctx.device = { ...payload };
          return ctx;
        }),
        assignAuthToken: assign((ctx, { payload }) => {
          if (!payload || !payload.authToken) return ctx;
          ctx.authToken = payload.authToken;
          return ctx;
        }),
        assignScopedAuthToken: assign((ctx, { payload }) => {
          if (!payload || !payload) return ctx;
          ctx.scopedAuthToken = payload;
          return ctx;
        }),
        assignPasskeyRegistrationWindow: assign((ctx, { payload }) => {
          if (!payload) return ctx;
          ctx.passkeyRegistrationWindow = payload;
          return ctx;
        }),
      },
    },
  );

export default createAuthIdentifyAppMachine;
