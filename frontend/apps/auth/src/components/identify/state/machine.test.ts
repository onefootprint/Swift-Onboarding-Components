import type { DeviceInfo } from '@onefootprint/idv';
import type {
  ChallengeData,
  IdentifyBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import {
  ChallengeKind,
  CLIENT_PUBLIC_KEY_HEADER,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';
import { AuthMethodKind } from '@onefootprint/types/src/data';
import { interpret } from 'xstate';

import createIdentifyMachine from './machine';
import { IdentifyVariant } from './types';

const challengeKindToAuthMethod: Record<ChallengeKind, AuthMethodKind> = {
  [ChallengeKind.biometric]: AuthMethodKind.passkey,
  [ChallengeKind.sms]: AuthMethodKind.phone,
  [ChallengeKind.email]: AuthMethodKind.email,
};

const CHALLENGE_DATA: ChallengeData = {
  challengeToken: 'challenge_token_info',
  challengeKind: ChallengeKind.sms,
};

const getFixtureUser = (
  availableChallengeKinds: ChallengeKind[],
): IdentifiedUser => ({
  isUnverified: false,
  availableChallengeKinds,
  authMethods: availableChallengeKinds.map(k => ({
    kind: challengeKindToAuthMethod[k],
    isVerified: true,
  })),
  hasSyncablePasskey: true,
});

const getOnboardingConfig = (
  isLive = true,
  isNoPhoneFlow = false,
): PublicOnboardingConfig => ({
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
});

const getDevice = (): DeviceInfo => ({
  type: 'mobile',
  hasSupportForWebauthn: true,
  osName: 'iOS',
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
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        successfulIdentifier: { email: 'belce@onefootprint.com' },
        user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
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
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        user: undefined,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+16509878899',
          successfulIdentifier: { phoneNumber: '+16509878899' },
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        phoneNumber: '+16509878899',
        successfulIdentifier: { phoneNumber: '+16509878899' },
        user: getFixtureUser([ChallengeKind.sms]),
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
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        user: undefined,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+16509878899',
          successfulIdentifier: { phoneNumber: '+16509878899' },
          user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        phoneNumber: '+16509878899',
        successfulIdentifier: { phoneNumber: '+16509878899' },
        user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          authToken: 'token',
        },
      });
      expect(state.context.challenge).toEqual({
        authToken: 'token',
      });
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
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        user: undefined,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+16509878899',
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        phoneNumber: '+16509878899',
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
        type: 'identified',
        payload: {
          phoneNumber: '+16509878899',
          user: undefined,
        },
      });
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
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        user: undefined,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      // Edit the email address
      state = machine.send({
        type: 'identifyReset',
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
          phoneNumber: '+15555550100',
          email: 'sandbox@onefootprint.com',
        },
      });

      let { state } = machine;
      expect(state.value).toEqual('initBootstrap');

      state = machine.send({
        type: 'bootstrapDataInvalid',
      });
      expect(state.context.identify).toEqual({
        email: undefined,
        phoneNumber: undefined,
        successfulIdentifier: undefined,
        user: undefined,
      });
      expect(state.value).toEqual('emailIdentification');
    });

    it('identify failed sends collects remaining phone number', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        bootstrapData: {
          email: 'sandbox@onefootprint.com',
        },
      });

      let { state } = machine;
      expect(state.value).toEqual('initBootstrap');

      state = machine.send({
        type: 'identifyFailed',
        payload: {
          email: 'sandbox@onefootprint.com',
        },
      });
      expect(state.context.identify).toEqual({
        email: 'sandbox@onefootprint.com',
        phoneNumber: undefined,
        successfulIdentifier: undefined,
        user: undefined,
      });
      expect(state.value).toEqual('phoneIdentification');
    });

    it('identify failed sends collects remaining email', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
        bootstrapData: {
          phoneNumber: '+15555550100',
        },
      });

      let { state } = machine;
      expect(state.value).toEqual('initBootstrap');

      state = machine.send({
        type: 'identifyFailed',
        payload: {
          phoneNumber: '+15555550100',
        },
      });
      expect(state.context.identify).toEqual({
        email: undefined,
        phoneNumber: '+15555550100',
        successfulIdentifier: undefined,
        user: undefined,
      });
      expect(state.value).toEqual('emailIdentification');
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

      state = machine.send({
        type: 'identifyFailed',
        payload: {
          email: 'sandbox@onefootprint.com',
          phoneNumber: '+15555550100',
        },
      });
      expect(state.context.identify).toEqual({
        email: 'sandbox@onefootprint.com',
        phoneNumber: '+15555550100',
        successfulIdentifier: undefined,
        user: undefined,
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
      expect(state.value).toEqual('initBootstrap');

      state = machine.send({
        type: 'identifyFailed',
        payload: {
          email: 'sandbox@onefootprint.com',
          phoneNumber: '+15555550100',
        },
      });
      expect(state.context.identify).toEqual({
        email: 'sandbox@onefootprint.com',
        phoneNumber: '+15555550100',
        successfulIdentifier: undefined,
        user: undefined,
      });
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
        type: 'identified',
        payload: {
          successfulIdentifier: { email: 'sandbox@onefootprint.com' },
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifier: { email: 'sandbox@onefootprint.com' },
        user: getFixtureUser([ChallengeKind.sms]),
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
        type: 'identified',
        payload: {
          successfulIdentifier: { email: 'sandbox@onefootprint.com' },
          user: getFixtureUser([ChallengeKind.sms, ChallengeKind.biometric]),
        },
      });
      expect(state.context.identify).toEqual({
        successfulIdentifier: { email: 'sandbox@onefootprint.com' },
        user: getFixtureUser([ChallengeKind.sms, ChallengeKind.biometric]),
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

      // When the user is identified, we should always go to the challenge select screen, even if
      // there's only one available challenge
      let state = machine.send({
        type: 'identified',
        payload: {
          successfulIdentifier: { authToken: 'utok_xxx' },
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        user: getFixtureUser([ChallengeKind.sms]),
        successfulIdentifier: { authToken: 'utok_xxx' },
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
        type: 'identified',
        payload: {
          email: 'hayes@valley.com',
          successfulIdentifier: { email: 'hayes@valley.com' },
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
        user: getFixtureUser([ChallengeKind.sms]),
        successfulIdentifier: { email: 'hayes@valley.com' },
      });
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
        email: 'hayes@valley.com',
        user: undefined,
        successfulIdentifier: undefined,
      });
      expect(state.context.challenge.challengeData).toBeTruthy();
      expect(state.value).toEqual('emailIdentification');

      // Now, don't identify by email, but identify by phone instead
      state = machine.send({
        type: 'identified',
        payload: {
          email: 'hayes@valley.com',
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
      });
      expect(state.value).toEqual('phoneIdentification');
      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifier: { phoneNumber: '+15555550100' },
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
        phoneNumber: '+15555550100',
        user: getFixtureUser([ChallengeKind.sms]),
        successfulIdentifier: { phoneNumber: '+15555550100' },
      });
      expect(state.context.challenge.challengeData).toBeFalsy(); // Should clear because phone number updated from null
      expect(state.value).toEqual('smsChallenge');

      // Make sure we can go back again. Should go back to phoneIdentification and clear found user, but not challenge data
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
        phoneNumber: '+15555550100',
        user: undefined,
        successfulIdentifier: undefined,
      });
      expect(state.value).toEqual('phoneIdentification');

      // Identify by phone again
      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifier: { phoneNumber: '+15555550100' },
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.value).toEqual('smsChallenge');

      // Complete the challenge
      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
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
        config: getOnboardingConfig(),
      });
      let state = machine.send({
        type: 'identified',
        payload: {
          email: 'hayes@valley.com',
          successfulIdentifier: { email: 'hayes@valley.com' },
          user: getFixtureUser([ChallengeKind.email]),
        },
      });
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
        user: getFixtureUser([ChallengeKind.email]),
        successfulIdentifier: { email: 'hayes@valley.com' },
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
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
        user: undefined,
        successfulIdentifier: undefined,
      });
      expect(state.context.challenge.challengeData).toBeTruthy();
      expect(state.value).toEqual('emailIdentification');

      // And then go back through the email challenge
      state = machine.send({
        type: 'identified',
        payload: {
          email: 'hayes@valley.com',
          successfulIdentifier: { email: 'hayes@valley.com' },
          user: getFixtureUser([ChallengeKind.email]),
        },
      });
      expect(state.context.challenge.challengeData).toBeTruthy();

      // Complete the challenge
      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        challengeData: CHALLENGE_DATA,
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });

    it('goes to challenge selector when there are multiple challenge options', () => {
      const machine = createMachine({
        config: getOnboardingConfig(),
      });
      const identifiedPayload = {
        email: 'belce@onefootprint.com',
        successfulIdentifier: { email: 'belce@onefootprint.com' },
        user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
      };
      let state = machine.send({
        type: 'identified',
        payload: identifiedPayload,
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        successfulIdentifier: { email: 'belce@onefootprint.com' },
        user: getFixtureUser([ChallengeKind.biometric, ChallengeKind.sms]),
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Make sure we can go back
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.value).toEqual('emailIdentification');

      state = machine.send({
        type: 'identified',
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
        type: 'identified',
        payload: {
          email: 'hayes@valley.com',
          successfulIdentifier: { email: 'hayes@valley.com' },
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
        type: 'identified',
        payload: {
          email: 'hayes2@valley.com',
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'hayes2@valley.com',
        user: undefined,
        successfulIdentifier: undefined,
      });
      expect(state.context.challenge.challengeData).toBeFalsy();
      expect(state.value).toEqual('phoneIdentification');

      // And then go back through the SMS challenge
      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifier: { phoneNumber: '+15555550100' },
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
        type: 'identified',
        payload: {
          phoneNumber: '+15555550111',
          successfulIdentifier: { phoneNumber: '+15555550111' },
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
      const user = getFixtureUser([
        ChallengeKind.biometric,
        ChallengeKind.sms,
        ChallengeKind.email,
      ]);

      // First, identify via email
      let state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          user,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        successfulIdentifier: { email: 'belce@onefootprint.com' },
        user,
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Go back, and then put in a different email that we don't identify with
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        user: undefined,
        successfulIdentifier: undefined,
      });
      expect(state.value).toEqual('emailIdentification');
      state = machine.send({
        type: 'identified',
        payload: {
          email: 'hayes@valley.com',
          user: undefined,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
        user: undefined,
        successfulIdentifier: undefined,
      });
      expect(state.value).toEqual('phoneIdentification');

      // Put in a phone number that we do identify
      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifier: { phoneNumber: '+15555550100' },
          user,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
        phoneNumber: '+15555550100',
        successfulIdentifier: { phoneNumber: '+15555550100' },
        user,
      });
      expect(state.value).toEqual('challengeSelectOrPasskey');

      // Go back - we should return to the phone input screen
      state = machine.send({ type: 'navigatedToPrevPage' });
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
        phoneNumber: '+15555550100',
        user: undefined,
        successfulIdentifier: undefined,
      });
      expect(state.value).toEqual('phoneIdentification');

      // And then continue to the challenge selector
      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+15555550100',
          successfulIdentifier: { phoneNumber: '+15555550100' },
          user,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'hayes@valley.com',
        phoneNumber: '+15555550100',
        user,
        successfulIdentifier: { phoneNumber: '+15555550100' },
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

      // Finally, identify with a different email address
      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          user,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        successfulIdentifier: { email: 'belce@onefootprint.com' },
        user,
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

      // When the user is identified, we should always go to the challenge select screen, even if
      // there's only one available challenge
      let state = machine.send({
        type: 'identified',
        payload: {
          successfulIdentifier: { authToken: 'utok_xxx' },
          user: getFixtureUser([ChallengeKind.sms]),
        },
      });
      expect(state.context.identify).toEqual({
        email: undefined,
        phoneNumber: undefined,
        successfulIdentifier: { authToken: 'utok_xxx' },
        user: getFixtureUser([ChallengeKind.sms]),
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
