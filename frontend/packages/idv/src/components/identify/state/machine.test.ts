import type { ChallengeData, PublicOnboardingConfig, UserTokenScope } from '@onefootprint/types';
import {
  AuthMethodKind,
  CLIENT_PUBLIC_KEY_HEADER,
  ChallengeKind,
  IdDI,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';
import { interpret } from 'xstate';

import type { DeviceInfo } from '../../../hooks';
import createIdentifyMachine from './machine';
import type { IdentifyBootstrapData } from './types';
import { IdentifyVariant, SuccessfulIdentifier } from './types';

const challengeKindToAuthMethod: Record<ChallengeKind, AuthMethodKind> = {
  [ChallengeKind.biometric]: AuthMethodKind.passkey,
  [ChallengeKind.sms]: AuthMethodKind.phone,
  [ChallengeKind.email]: AuthMethodKind.email,
};

const CHALLENGE_DATA: ChallengeData = {
  token: 'utok_xxx',
  challengeToken: 'challenge_token_info',
  challengeKind: ChallengeKind.sms,
};

const getFixtureUser = (availableChallengeKinds: ChallengeKind[], tokenScopes?: UserTokenScope[]): IdentifiedUser => ({
  token: 'utok_xxx',
  isUnverified: false,
  availableChallengeKinds,
  authMethods: availableChallengeKinds.map(k => ({
    kind: challengeKindToAuthMethod[k],
    isVerified: true,
  })),
  hasSyncablePasskey: true,
  tokenScopes: tokenScopes ?? [],
  matchingFps: [IdDI.phoneNumber],
});

const getOnboardingConfig = (isLive = true, isNoPhoneFlow = false): PublicOnboardingConfig => ({
  isLive,
  logoUrl: 'url',
  privacyPolicyUrl: 'url',
  name: 'tenant',
  orgName: 'tenantOrg',
  orgId: 'orgId',
  status: OnboardingConfigStatus.enabled,
  isAppClipEnabled: false,
  isInstantAppEnabled: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isNoPhoneFlow,
  requiresIdDoc: false,
  key: 'key',
  isKyb: false,
  allowInternationalResidents: false,
  requiredAuthMethods: [isNoPhoneFlow ? AuthMethodKind.email : AuthMethodKind.phone],
});

const getDevice = (): DeviceInfo => ({
  type: 'mobile',
  hasSupportForWebauthn: true,
  osName: 'iOS',
  browser: 'Mobile Safari',
});

const createMachine = ({
  bootstrapData,
  initialAuthToken,
  config,
  variant = IdentifyVariant.auth,
}: {
  bootstrapData?: IdentifyBootstrapData;
  initialAuthToken?: string;
  config?: PublicOnboardingConfig;
  variant?: IdentifyVariant;
}) => {
  const machine = interpret(
    createIdentifyMachine({
      bootstrapData,
      initialAuthToken,
      config,
      obConfigAuth: config && { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
      device: getDevice(),
      isLive: config?.isLive || true,
      variant,
    }),
  );
  machine.start();
  return machine;
};

describe('Identify Machine Tests', () => {
  describe('with existing account', () => {
    it('successfully ids the user from email', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });

      let { state } = machine;
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      });

      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'belce@onefootprint.com',
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.email],
        user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
        identifyToken: 'utok_xxx',
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.value).toEqual('challengeSelectOrPasskey');

      state = machine.send({
        type: 'tryAnotherWay',
        payload: ChallengeKind.email,
      });
      expect(state.value).toEqual('phoneKbaChallenge');

      state = machine.send({
        type: 'navigatedToPrevPage',
        payload: { prev: 'challengeSelectOrPasskey' },
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');
    });

    it('successfully ids the user using phone number, after email mismatch, starts sms challenge', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });

      let { state } = machine;
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      });

      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'belce@onefootprint.com',
          user: undefined,
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: undefined,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+16509878899',
          successfulIdentifiers: [SuccessfulIdentifier.phone],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual('+16509878899');
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.phone],
        user: getFixtureUser([ChallengeKind.sms]),
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('smsChallenge');
    });

    it('successfully ids the user using phone number, after email mismatch, starts biometric challenge', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });

      let { state } = machine;
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      });

      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'belce@onefootprint.com',
          user: undefined,
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: undefined,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+16509878899',
          successfulIdentifiers: [SuccessfulIdentifier.phone],
          user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual('+16509878899');
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.phone],
        user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.passkey,
          authToken: 'token',
        },
      });
      expect(state.context.challenge).toEqual({
        authToken: 'token',
      });
      expect(state.value).toEqual('success');
    });

    it('successfully ids the user from an auth token', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        initialAuthToken: 'utok_xxx',
      });

      let { state } = machine;
      expect(state.value).toEqual('initAuthToken');

      state = machine.send({
        type: 'identifyResult',
        payload: {
          successfulIdentifiers: [SuccessfulIdentifier.authToken],
          user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.authToken],
        user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');
      expect(state.context.challenge.authToken).toBeFalsy();
    });

    it('skips to success after identifying from auth token with sufficient scopes', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        initialAuthToken: 'utok_xxx',
      });

      let { state } = machine;
      expect(state.value).toEqual('initAuthToken');

      state = machine.send({
        type: 'identifiedWithSufficientScopes',
        payload: {
          authToken: 'utok_xxx',
        },
      });
      expect(state.context.identify).toEqual({});
      expect(state.context.challenge.authToken).toEqual('utok_xxx');
      expect(state.value).toEqual('success');
    });
  });

  describe('with new user', () => {
    it('registers new phone', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });

      let { state } = machine;
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      });

      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'belce@onefootprint.com',
          user: undefined,
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: undefined,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+16509878899',
          user: undefined,
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual('+16509878899');
      expect(state.context.identify).toEqual({
        user: undefined,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('smsChallenge');

      // Go back and change the phone number
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+16509878899',
          user: undefined,
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual('+16509878899');
      expect(state.value).toEqual('smsChallenge');
    });

    it('editing email while registering phone', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });

      let { state } = machine;
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      });

      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'belce@onefootprint.com',
          user: undefined,
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: undefined,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      // Edit the email address
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.context.identify).toEqual({});
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('emailIdentification');
    });
  });

  describe('with bootstrap data', () => {
    it('invalid bootstrap data goes to emailIdentification', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        bootstrapData: {
          phoneNumber: 'blah',
          email: 'flerp',
        },
      });
      const { state } = machine;
      expect(state.context.email).toEqual(undefined);
      expect(state.context.phoneNumber).toEqual(undefined);

      expect(state.value).toEqual('emailIdentification');
    });

    it('identify failed collects remaining phone number', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        bootstrapData: {
          email: 'sandbox@onefootprint.com',
        },
      });

      let { state } = machine;
      expect(state.context.email).toEqual({
        value: 'sandbox@onefootprint.com',
        isBootstrap: true,
      });
      expect(state.context.phoneNumber).toEqual(undefined);
      expect(state.value).toEqual('initBootstrap');

      state = machine.send({
        type: 'bootstrapReceived',
        payload: {
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifiers: undefined,
        user: undefined,
      });
      expect(state.context.email).toEqual({
        value: 'sandbox@onefootprint.com',
        isBootstrap: true,
      });
      expect(state.context.phoneNumber).toEqual(undefined);
      expect(state.value).toEqual('phoneIdentification');

      // Collect phone
      state = machine.send({
        type: 'identifyResult',
        payload: {
          user: undefined,
          phoneNumber: '+15555550100',
        },
      });
      expect(state.context.email).toEqual({
        value: 'sandbox@onefootprint.com',
        isBootstrap: true,
      });
      expect(state.context.phoneNumber).toEqual({
        value: '+15555550100',
        isBootstrap: false,
      });
    });

    it('identify failed collects remaining email', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        bootstrapData: {
          phoneNumber: '+15555550100',
        },
      });

      let { state } = machine;
      expect(state.value).toEqual('initBootstrap');
      expect(state.context.email).toEqual(undefined);
      expect(state.context.phoneNumber).toEqual({
        value: '+15555550100',
        isBootstrap: true,
      });

      state = machine.send({
        type: 'bootstrapReceived',
        payload: {
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifiers: undefined,
        user: undefined,
      });
      expect(state.context.phoneNumber).toEqual({
        value: '+15555550100',
        isBootstrap: true,
      });
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');
      expect(state.value).toEqual('emailIdentification');

      // Collect email
      state = machine.send({
        type: 'identifyResult',
        payload: {
          user: undefined,
          email: 'sandbox@onefootprint.com',
        },
      });
      expect(state.context.email).toEqual({
        value: 'sandbox@onefootprint.com',
        isBootstrap: false,
      });
      expect(state.context.phoneNumber).toEqual({
        value: '+15555550100',
        isBootstrap: true,
      });
    });

    it('identify failed with phone and email goes straight to sms signup challenge', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        bootstrapData: {
          email: 'sandbox@onefootprint.com',
          phoneNumber: '+15555550100',
        },
      });

      let { state } = machine;
      expect(state.value).toEqual('initBootstrap');
      expect(state.context.email?.value).toEqual('sandbox@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');

      state = machine.send({
        type: 'bootstrapReceived',
        payload: {
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifiers: undefined,
        user: undefined,
      });
      expect(state.context.email).toEqual({
        value: 'sandbox@onefootprint.com',
        isBootstrap: true,
      });
      expect(state.context.phoneNumber).toEqual({
        value: '+15555550100',
        isBootstrap: true,
      });
      expect(state.value).toEqual('smsChallenge');

      state = machine.send({
        type: 'tryAnotherWay',
        payload: ChallengeKind.email,
      });
      expect(state.value).toEqual('phoneKbaChallenge');

      state = machine.send({
        type: 'navigatedToPrevPage',
        payload: { prev: 'smsChallenge' },
      });
      expect(state.value).toEqual('smsChallenge');
    });

    it('identify failed with phone and email goes straight to email signup challenge when in no phone', () => {
      const machine = createMachine({
        config: getOnboardingConfig(true, true),
        bootstrapData: {
          email: 'sandbox@onefootprint.com',
          phoneNumber: '+15555550100',
        },
      });

      let { state } = machine;
      expect(state.context.email?.value).toEqual('sandbox@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');
      expect(state.value).toEqual('initBootstrap');

      state = machine.send({
        type: 'bootstrapReceived',
        payload: {
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifiers: undefined,
        user: undefined,
      });
      expect(state.context.email?.value).toEqual('sandbox@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');
      expect(state.value).toEqual('emailChallenge');
    });

    it('identify succeeded with only SMS available goes to sms challenge', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        bootstrapData: {
          email: 'sandbox@onefootprint.com',
          phoneNumber: '+15555550100',
        },
      });

      let { state } = machine;
      expect(state.value).toEqual('initBootstrap');

      state = machine.send({
        type: 'bootstrapReceived',
        payload: {
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.email],
        user: getFixtureUser([ChallengeKind.sms]),
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('smsChallenge');
    });

    it('identify succeeded with multi challenge goes to challenge selector', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        bootstrapData: {
          email: 'sandbox@onefootprint.com',
          phoneNumber: '+15555550100',
        },
      });

      let { state } = machine;
      expect(state.value).toEqual('initBootstrap');

      state = machine.send({
        type: 'bootstrapReceived',
        payload: {
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user: getFixtureUser([ChallengeKind.sms, ChallengeKind.biometric]),
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.email],
        user: getFixtureUser([ChallengeKind.sms, ChallengeKind.biometric]),
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');
    });
  });

  describe('challenge navigation', () => {
    it('init with an auth token', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        initialAuthToken: 'utok_xxx',
      });
      expect(machine.state.value).toEqual('initAuthToken');
      expect(machine.state.context.initialAuthToken).toBeTruthy();

      // When the user is identifyResult, we should always go to the challenge select screen, even if
      // there's only one available challenge
      let state = machine.send({
        type: 'identifyResult',
        payload: {
          successfulIdentifiers: [SuccessfulIdentifier.authToken],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        user: getFixtureUser([ChallengeKind.sms]),
        successfulIdentifiers: [SuccessfulIdentifier.authToken],
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('smsChallenge');

      // Receive challenge data from the backend
      state = machine.send({
        type: 'challengeReceived',
        payload: CHALLENGE_DATA,
      });
      expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
      expect(state.value).toEqual('smsChallenge');

      // Complete the challenge
      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.phone,
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        challengeData: CHALLENGE_DATA,
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });

    it('properly goes to SMS when only SMS challenge available', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });
      let state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'hayes@valley.com',
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        user: getFixtureUser([ChallengeKind.sms]),
        successfulIdentifiers: [SuccessfulIdentifier.email],
        identifyToken: 'utok_xxx',
      });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.value).toEqual('smsChallenge');

      // Receive challenge data from the backend
      state = machine.send({
        type: 'challengeReceived',
        payload: CHALLENGE_DATA,
      });
      expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
      expect(state.value).toEqual('smsChallenge');

      // Make sure we can go back. Should clear found user, but not challenge data
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.identify).toEqual({
        user: undefined,
        successfulIdentifiers: undefined,
      });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.challenge.challengeData).toBeTruthy();
      expect(state.value).toEqual('emailIdentification');

      // Now, don't identify by email, but identify by phone instead
      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'hayes@valley.com',
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({});
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.value).toEqual('phoneIdentification');
      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifiers: [SuccessfulIdentifier.phone],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');
      expect(state.context.identify).toEqual({
        user: getFixtureUser([ChallengeKind.sms]),
        successfulIdentifiers: [SuccessfulIdentifier.phone],
        identifyToken: 'utok_xxx',
      });
      expect(state.context.challenge.challengeData).toBeFalsy(); // Should clear because phone number updated from null
      expect(state.value).toEqual('smsChallenge');

      // Make sure we can go back again. Should go back to phoneIdentification and clear found user, but not challenge data
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');
      expect(state.context.identify).toEqual({
        user: undefined,
        successfulIdentifiers: undefined,
      });
      expect(state.value).toEqual('phoneIdentification');

      // Identify by phone again
      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifiers: [SuccessfulIdentifier.phone],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.value).toEqual('smsChallenge');

      // Complete the challenge
      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.phone,
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });

    it('properly goes to email when only email challenge available', () => {
      const machine = createMachine({
        config: getOnboardingConfig(true, true),
      });
      let state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'hayes@valley.com',
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user: getFixtureUser([ChallengeKind.email]),
        },
      });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: getFixtureUser([ChallengeKind.email]),
        successfulIdentifiers: [SuccessfulIdentifier.email],
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('emailChallenge');

      // Receive challenge data from the backend
      state = machine.send({
        type: 'challengeReceived',
        payload: CHALLENGE_DATA,
      });
      expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
      expect(state.value).toEqual('emailChallenge');

      // Make sure we can go back. Should clear found user but not the challenge data
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: undefined,
        successfulIdentifiers: undefined,
      });
      expect(state.context.challenge.challengeData).toBeTruthy();
      expect(state.value).toEqual('emailIdentification');

      // And then go back through the email challenge
      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'hayes@valley.com',
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user: getFixtureUser([ChallengeKind.email]),
        },
      });
      expect(state.context.challenge.challengeData).toBeTruthy();

      // Complete the challenge
      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.email,
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        challengeData: CHALLENGE_DATA,
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });

    it('requests adding phone when user doesnt have phone and playbook requires', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });
      let state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'hayes@valley.com',
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user: getFixtureUser([ChallengeKind.email]),
        },
      });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: getFixtureUser([ChallengeKind.email]),
        successfulIdentifiers: [SuccessfulIdentifier.email],
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('emailChallenge');

      // Receive challenge data from the backend
      state = machine.send({
        type: 'challengeReceived',
        payload: CHALLENGE_DATA,
      });
      expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
      expect(state.value).toEqual('emailChallenge');

      // Complete the challenge. We are then asked to provide the phone
      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.email,
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        challengeData: CHALLENGE_DATA,
        authToken: 'authToken',
      });
      expect(state.value).toEqual('addPhone');

      // Complete challenge to add phone
      state = machine.send({
        type: 'phoneAdded',
        payload: {
          phoneNumber: '+15555550100',
        },
      });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');
      expect(state.context.identify).toEqual({
        user: getFixtureUser([ChallengeKind.email]),
        successfulIdentifiers: [SuccessfulIdentifier.email],
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('success');
    });

    it('goes to challenge selector when there are multiple challenge options', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });
      const identifiedPayload = {
        email: 'belce@onefootprint.com',
        successfulIdentifiers: [SuccessfulIdentifier.email],
        user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
      };
      let state = machine.send({
        type: 'identifyResult',
        payload: identifiedPayload,
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.email],
        user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Make sure we can go back
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.value).toEqual('emailIdentification');

      state = machine.send({
        type: 'identifyResult',
        payload: identifiedPayload,
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Choose SMS challenge
      state = machine.send({
        type: 'goToChallenge',
        payload: ChallengeKind.sms,
      });
      expect(state.value).toEqual('smsChallenge');

      // Receive challenge data from the backend
      state = machine.send({
        type: 'challengeReceived',
        payload: CHALLENGE_DATA,
      });
      expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
      expect(state.value).toEqual('smsChallenge');

      // Make sure we can go back, shouldn't clear challenge data
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.value).toEqual('challengeSelectOrPasskey');
      expect(state.context.challenge.challengeData).toBeTruthy();

      // Complete SMS challenge
      state = machine.send({
        type: 'goToChallenge',
        payload: ChallengeKind.sms,
      });
      expect(state.value).toEqual('smsChallenge');
      expect(state.context.challenge.challengeData).toBeTruthy();

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.phone,
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        challengeData: CHALLENGE_DATA,
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });

    it('clears challenge data when phone/email change', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });
      let state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'hayes@valley.com',
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.value).toEqual('smsChallenge');

      // Receive challenge data from the backend
      state = machine.send({
        type: 'challengeReceived',
        payload: CHALLENGE_DATA,
      });
      expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
      expect(state.value).toEqual('smsChallenge');

      // Go back, challenge data shouldn't be cleared
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.challenge.challengeData).toBeTruthy();
      expect(state.value).toEqual('emailIdentification');

      // When we enter a different email, challenge data should be cleared
      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'hayes2@valley.com',
          user: undefined,
        },
      });
      expect(state.context.email?.value).toEqual('hayes2@valley.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: undefined,
        successfulIdentifiers: undefined,
      });
      expect(state.context.challenge.challengeData).toBeFalsy();
      expect(state.value).toEqual('phoneIdentification');

      // And then go back through the SMS challenge
      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifiers: [SuccessfulIdentifier.phone],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.value).toEqual('smsChallenge');

      // Receive challenge data from the backend
      state = machine.send({
        type: 'challengeReceived',
        payload: CHALLENGE_DATA,
      });
      expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
      expect(state.value).toEqual('smsChallenge');

      // Go back, challenge data shouldn't be cleared
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.challenge.challengeData).toBeTruthy();
      expect(state.value).toEqual('phoneIdentification');

      // When we enter a different phone, challenge data should be cleared
      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+15555550111',
          successfulIdentifiers: [SuccessfulIdentifier.phone],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.challenge.challengeData).toBeFalsy();
      expect(state.value).toEqual('smsChallenge');

      // Receive challenge data from the backend
      state = machine.send({
        type: 'challengeReceived',
        payload: CHALLENGE_DATA,
      });
      expect(state.context.challenge.challengeData).toEqual(CHALLENGE_DATA);
      expect(state.value).toEqual('smsChallenge');

      // Complete the challenge
      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.phone,
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        challengeData: CHALLENGE_DATA,
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });

    it('complex navigation back and forth', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });
      const user = getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms, ChallengeKind.email]);

      // First, identify via email
      let state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'belce@onefootprint.com',
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user,
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.email],
        user,
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Go back, and then put in a different email that we don't identify with
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: undefined,
        successfulIdentifiers: undefined,
      });
      expect(state.value).toEqual('emailIdentification');
      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'hayes@valley.com',
          user: undefined,
        },
      });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        user: undefined,
        successfulIdentifiers: undefined,
      });
      expect(state.value).toEqual('phoneIdentification');

      // Put in a phone number that we do identify
      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifiers: [SuccessfulIdentifier.phone],
          user,
        },
      });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.phone],
        user,
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Go back - we should return to the phone input screen
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');
      expect(state.context.identify).toEqual({
        user: undefined,
        successfulIdentifiers: undefined,
      });
      expect(state.value).toEqual('phoneIdentification');

      // And then continue to the challenge selector
      state = machine.send({
        type: 'identifyResult',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifiers: [SuccessfulIdentifier.phone],
          user,
        },
      });
      expect(state.context.email?.value).toEqual('hayes@valley.com');
      expect(state.context.phoneNumber?.value).toEqual('+15555550100');
      expect(state.context.identify).toEqual({
        user,
        successfulIdentifiers: [SuccessfulIdentifier.phone],
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Choose SMS challenge and then go back
      state = machine.send({
        type: 'goToChallenge',
        payload: ChallengeKind.sms,
      });
      expect(state.value).toEqual('smsChallenge');
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Then choose the email challenge and go all the way back to the email entry
      state = machine.send({
        type: 'goToChallenge',
        payload: ChallengeKind.email,
      });
      expect(state.value).toEqual('emailChallenge');
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.value).toEqual('challengeSelectOrPasskey');
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.value).toEqual('phoneIdentification');
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.value).toEqual('emailIdentification');

      // Finally, identify with a different email address, should have empty phone
      state = machine.send({
        type: 'identifyResult',
        payload: {
          email: 'belce@onefootprint.com',
          successfulIdentifiers: [SuccessfulIdentifier.email],
          user,
        },
      });
      expect(state.context.email?.value).toEqual('belce@onefootprint.com');
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.email],
        user,
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Complete email challenge
      state = machine.send({
        type: 'goToChallenge',
        payload: ChallengeKind.email,
      });
      expect(state.value).toEqual('emailChallenge');

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.email,
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });
  });

  describe('IdentifyVariant.updateLoginMethods', () => {
    it('invalid auth token', () => {
      const machine = createMachine({
        initialAuthToken: 'utok_',
        variant: IdentifyVariant.updateLoginMethods,
      });

      expect(machine.state.value).toEqual('initAuthToken');
      expect(machine.state.context.initialAuthToken).toBeTruthy();

      const state = machine.send({
        type: 'authTokenInvalid',
      });
      expect(state.value).toEqual('authTokenInvalid');
    });

    it('valid auth token', () => {
      const machine = createMachine({
        initialAuthToken: 'utok_',
        variant: IdentifyVariant.updateLoginMethods,
      });

      expect(machine.state.value).toEqual('initAuthToken');

      // When the user is identifyResult, we should always go to the challenge select screen, even if
      // there's only one available challenge
      let state = machine.send({
        type: 'identifyResult',
        payload: {
          successfulIdentifiers: [SuccessfulIdentifier.authToken],
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.email?.value).toEqual(undefined);
      expect(state.context.phoneNumber?.value).toEqual(undefined);
      expect(state.context.identify).toEqual({
        successfulIdentifiers: [SuccessfulIdentifier.authToken],
        user: getFixtureUser([ChallengeKind.sms]),
        identifyToken: 'utok_xxx',
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Choose SMS challenge and then go back
      state = machine.send({
        type: 'goToChallenge',
        payload: ChallengeKind.sms,
      });
      expect(state.value).toEqual('smsChallenge');
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Then finally finish SMS challenge
      state = machine.send({
        type: 'goToChallenge',
        payload: ChallengeKind.sms,
      });
      expect(state.value).toEqual('smsChallenge');

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          kind: AuthMethodKind.phone,
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });
  });
});
