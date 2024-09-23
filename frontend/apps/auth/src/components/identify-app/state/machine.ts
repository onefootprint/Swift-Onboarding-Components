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
        invalidAuthConfigReceived: { target: 'invalidAuthConfig' },
        invalidConfigReceived: { target: 'invalidConfig' },
        scopedAuthTokenReceived: { actions: ['assignScopedAuthToken'] },
        sdkUrlNotAllowedReceived: { target: 'sdkUrlNotAllowed' },
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
                target: 'onboardingValidation',
                actions: ['assignIdentificationResult'],
              },
            ],
          },
        },
        onboardingValidation: {
          on: {
            onboardingValidationError: { target: 'unexpectedError' },
            onboardingValidationCompleted: [
              {
                cond: ctx => {
                  const noWebauthnSupport = !ctx.device?.hasSupportForWebauthn;
                  const passkeyAlreadyRegistered = !!ctx.isPasskeyAlreadyRegistered;
                  return noWebauthnSupport || passkeyAlreadyRegistered;
                },
                target: 'done',
                actions: ['assignValidationToken'],
              },
              {
                target: 'passkeyOptionalRegistration',
                actions: ['assignValidationToken'],
              },
            ],
          },
        },
        passkeyOptionalRegistration: {
          on: {
            passkeyRegistrationSkip: [{ target: 'done' }],
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
            passkeyProcessingCompleted: [{ target: 'done' }],
            passkeyProcessingError: [{ target: 'passkeyError' }],
          },
        },
        done: { type: 'final' },
        invalidAuthConfig: { type: 'final' },
        invalidConfig: { type: 'final' },
        passkeyCancelled: { type: 'final' },
        passkeyError: { type: 'final' },
        sdkUrlNotAllowed: { type: 'final' },
        unexpectedError: { type: 'final' },
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
        assignIdentificationResult: assign((ctx, { payload }) => {
          if (!payload || !payload.authToken) return ctx;
          ctx.authToken = payload.authToken;
          ctx.isPasskeyAlreadyRegistered = Boolean(payload.isPasskeyAlreadyRegistered);
          return ctx;
        }),
        assignValidationToken: assign((ctx, { payload }) => {
          if (!payload || !payload.validationToken) return ctx;
          ctx.validationToken = payload.validationToken;
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
