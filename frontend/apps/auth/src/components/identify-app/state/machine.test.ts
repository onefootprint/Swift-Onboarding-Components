import { describe, expect, it } from 'bun:test';
import { interpret } from 'xstate';

import type { PublicOnboardingConfig } from '@onefootprint/types';
import createAuthIdentifyAppMachine from './machine';

const fakeTab = { location: { href: 'https://fake.com' } } as unknown as Window;
const device = {
  browser: 'Mobile Safari',
  hasSupportForWebauthn: true,
  osName: 'iOS',
  type: 'mobile',
};

const authProps = {
  publicKey: 'ob_test_123',
  options: { showLogo: false },
};

const authConfig = {
  name: 'Auth test',
  key: 'ob_test_2TwubGlrWdKaJnWsQQKQYl',
  orgId: 'org_wrMg7lhSpZif14SIhC9ihL',
  orgName: 'Acme Inc.',
  logoUrl: 'https://i-dev.onefp.net/ol/Ie19k9UkMhEcn8gBJB_8y63WaTEchrnnoc5HC_tRu6g/X82lEtV4uufgWGU4Ue5UaN.png',
  privacyPolicyUrl: null,
  isLive: false,
  status: 'enabled' as PublicOnboardingConfig['status'],
  isAppClipEnabled: true,
  isInstantAppEnabled: false,
  appClipExperienceId: 'app_exp_l5WYCUXGG06At7X4B66U7l',
  isNoPhoneFlow: false,
  requiresIdDoc: false,
  canMakeRealDocScanCallsInSandbox: true,
  isKyb: false,
  allowInternationalResidents: false,
  supportedCountries: ['US'] as PublicOnboardingConfig['supportedCountries'],
  allowedOrigins: ['https://google.com', 'http://acme.com'],
  isStepupEnabled: false,
  kind: 'auth' as PublicOnboardingConfig['kind'],
  supportEmail: 'acme@onefootprint.com',
  supportPhone: '+155555550100',
  supportWebsite: 'https://demo.onefootprint.com/acme',
  requiredAuthMethods: undefined as PublicOnboardingConfig['requiredAuthMethods'],
};

const createMachine = () => {
  const machine = interpret(createAuthIdentifyAppMachine({}));
  machine.start();
  return machine;
};

describe('Auth Identify App Machine', () => {
  it('should ends at invalidAuthConfig', () => {
    const machine = createMachine();
    let { state } = machine;

    expect(state.value).toEqual('init');
    expect(state.context).toEqual({});

    state = machine.send({ type: 'invalidAuthConfigReceived' });
    expect(state.value).toEqual('invalidAuthConfig');

    expect(state.done).toEqual(true);
  });

  it('should ends at invalidConfig', () => {
    const machine = createMachine();
    let { state } = machine;

    expect(state.value).toEqual('init');
    expect(state.context).toEqual({});

    state = machine.send({ type: 'invalidConfigReceived' });
    expect(state.value).toEqual('invalidConfig');

    expect(state.done).toEqual(true);
  });

  it('should ends at sdkUrlNotAllowed', () => {
    const machine = createMachine();
    let { state } = machine;

    expect(state.value).toEqual('init');
    expect(state.context).toEqual({});

    state = machine.send({ type: 'sdkUrlNotAllowedReceived' });
    expect(state.value).toEqual('sdkUrlNotAllowed');

    expect(state.done).toEqual(true);
  });

  it('should ends at unexpectedError when validation failed', () => {
    const machine = createMachine();
    let { state } = machine;

    expect(state.value).toEqual('init');
    expect(state.context).toEqual({});

    state = machine.send({
      type: 'initPropsReceived',
      payload: {
        config: authConfig,
        device,
        props: authProps,
      },
    });
    expect(state.value).toEqual('identify');
    expect(state.context.props).toEqual(authProps);
    expect(state.context.config).toEqual(authConfig);
    expect(state.context.device).toEqual(device);

    state = machine.send({
      type: 'identifyCompleted',
      payload: { authToken: 'utok_123', isPasskeyAlreadyRegistered: true },
    });
    expect(state.value).toEqual('onboardingValidation');
    expect(state.context.authToken).toEqual('utok_123');
    expect(state.context.isPasskeyAlreadyRegistered).toEqual(true);

    state = machine.send({ type: 'onboardingValidationError', payload: new Error('error') });
    expect(state.value).toEqual('unexpectedError');

    expect(state.done).toEqual(true);
  });

  it('should ends early when passkey is already registered', () => {
    const machine = createMachine();
    let { state } = machine;

    expect(state.value).toEqual('init');
    expect(state.context).toEqual({});

    state = machine.send({
      type: 'initPropsReceived',
      payload: {
        config: authConfig,
        device,
        props: authProps,
      },
    });
    expect(state.value).toEqual('identify');
    expect(state.context.props).toEqual(authProps);
    expect(state.context.config).toEqual(authConfig);
    expect(state.context.device).toEqual(device);

    state = machine.send({
      type: 'identifyCompleted',
      payload: { authToken: 'utok_123', isPasskeyAlreadyRegistered: true },
    });
    expect(state.value).toEqual('onboardingValidation');
    expect(state.context.authToken).toEqual('utok_123');
    expect(state.context.isPasskeyAlreadyRegistered).toEqual(true);

    state = machine.send({ type: 'onboardingValidationCompleted', payload: { validationToken: 'vtok_123' } });
    expect(state.value).toEqual('done');

    expect(state.done).toEqual(true);
  });

  it('should ends at passkeyError', () => {
    const machine = createMachine();
    let { state } = machine;

    expect(state.value).toEqual('init');
    expect(state.context).toEqual({});

    state = machine.send({
      type: 'initPropsReceived',
      payload: {
        config: authConfig,
        device,
        props: authProps,
      },
    });
    expect(state.value).toEqual('identify');
    expect(state.context.props).toEqual(authProps);
    expect(state.context.config).toEqual(authConfig);
    expect(state.context.device).toEqual(device);

    state = machine.send({
      type: 'identifyCompleted',
      payload: { authToken: 'utok_123', isPasskeyAlreadyRegistered: false },
    });
    expect(state.context.authToken).toEqual('utok_123');
    expect(state.context.isPasskeyAlreadyRegistered).toEqual(false);
    expect(state.value).toEqual('onboardingValidation');

    state = machine.send({ type: 'onboardingValidationCompleted', payload: { validationToken: 'vtok_123' } });
    expect(state.value).toEqual('passkeyOptionalRegistration');

    state = machine.send({ type: 'passkeyRegistrationError', payload: new Error('error') });
    expect(state.value).toEqual('passkeyError');

    state = machine.send({ type: 'passkeyRegistrationSkip' });
    expect(state.value).toEqual('done');

    expect(state.done).toEqual(true);
  });

  it('should ends at passkeyCancelled', () => {
    const machine = createMachine();
    let { state } = machine;

    expect(state.value).toEqual('init');
    expect(state.context).toEqual({});

    state = machine.send({
      type: 'initPropsReceived',
      payload: {
        config: authConfig,
        device,
        props: authProps,
      },
    });
    expect(state.value).toEqual('identify');
    expect(state.context.props).toEqual(authProps);
    expect(state.context.config).toEqual(authConfig);
    expect(state.context.device).toEqual(device);

    state = machine.send({
      type: 'identifyCompleted',
      payload: { authToken: 'utok_123', isPasskeyAlreadyRegistered: false },
    });
    expect(state.context.authToken).toEqual('utok_123');
    expect(state.context.isPasskeyAlreadyRegistered).toEqual(false);
    expect(state.value).toEqual('onboardingValidation');

    state = machine.send({ type: 'onboardingValidationCompleted', payload: { validationToken: 'vtok_123' } });
    expect(state.value).toEqual('passkeyOptionalRegistration');

    state = machine.send({ type: 'passkeyRegistrationTabOpened', payload: fakeTab });
    state = machine.send({ type: 'scopedAuthTokenReceived', payload: 'tok_scoped' });
    expect(state.context.passkeyRegistrationWindow).toEqual(fakeTab);
    expect(state.context.scopedAuthToken).toEqual('tok_scoped');
    expect(state.value).toEqual('passkeyProcessing');

    state = machine.send({ type: 'passkeyProcessingCancelled' });
    expect(state.value).toEqual('passkeyCancelled');

    state = machine.send({ type: 'passkeyRegistrationSkip' });
    expect(state.value).toEqual('done');

    expect(state.done).toEqual(true);
  });

  it('should ends when passkeySuccess', () => {
    const machine = createMachine();
    let { state } = machine;

    expect(state.value).toEqual('init');
    expect(state.context).toEqual({});

    state = machine.send({
      type: 'initPropsReceived',
      payload: {
        config: authConfig,
        device,
        props: authProps,
      },
    });
    expect(state.value).toEqual('identify');
    expect(state.context.props).toEqual(authProps);
    expect(state.context.config).toEqual(authConfig);
    expect(state.context.device).toEqual(device);

    state = machine.send({
      type: 'identifyCompleted',
      payload: { authToken: 'utok_123', isPasskeyAlreadyRegistered: false },
    });
    expect(state.context.authToken).toEqual('utok_123');
    expect(state.context.isPasskeyAlreadyRegistered).toEqual(false);
    expect(state.value).toEqual('onboardingValidation');

    state = machine.send({ type: 'onboardingValidationCompleted', payload: { validationToken: 'vtok_123' } });
    expect(state.context.validationToken).toEqual('vtok_123');
    expect(state.value).toEqual('passkeyOptionalRegistration');

    state = machine.send({ type: 'passkeyRegistrationTabOpened', payload: fakeTab });
    state = machine.send({ type: 'scopedAuthTokenReceived', payload: 'tok_scoped' });
    expect(state.context.passkeyRegistrationWindow).toEqual(fakeTab);
    expect(state.context.scopedAuthToken).toEqual('tok_scoped');
    expect(state.value).toEqual('passkeyProcessing');

    state = machine.send({ type: 'passkeyProcessingCompleted' });
    expect(state.value).toEqual('done');

    expect(state.done).toEqual(true);
  });
});
