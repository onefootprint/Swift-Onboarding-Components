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
        scopedAuthTokenReceived: { actions: ['assignScopedAuthToken'] },
        invalidAuthConfigReceived: { target: 'invalidAuthConfig' },
        invalidConfigReceived: { target: 'invalidConfig' },
        sdkUrlNotAllowedReceived: { target: 'sdkUrlNotAllowed' },
        doneReceived: [{ target: 'done' }],
      },
      states: {
        init: {
          on: {
            initPropsReceived: [
              {
                target: 'identify',
                actions: ['assignInitProps'],
              },
            ],
          },
        },
        identify: {
          on: {
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
        assignInitProps: assign((ctx, { payload }) => {
          if (!payload) return ctx;
          ctx.config = payload.config ? { ...payload.config } : ctx.config;
          ctx.device = payload.device ? { ...payload.device } : ctx.device;
          ctx.props = payload.props ? { ...payload.props } : ctx.props;
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
