import { DeviceInfo } from '@onefootprint/hooks';
import {
  ChallengeKind,
  CLIENT_PUBLIC_KEY_HEADER,
  CollectedKycDataOption,
  IdentifyBootstrapData,
  OnboardingConfig,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import createIdentifyMachine from './machine';

describe('Identify Machine Tests', () => {
  const getOnboardingConfig = (isLive = true): OnboardingConfig => ({
    isLive,
    createdAt: 'date',
    id: 'id',
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: 'enabled',
    mustCollectData: [CollectedKycDataOption.name],
    canAccessData: [CollectedKycDataOption.name],
    isAppClipEnabled: false,
  });

  const getDevice = (): DeviceInfo => ({
    type: 'mobile',
    hasSupportForWebauthn: true,
  });

  const createMachine = (bootstrapData?: IdentifyBootstrapData) => {
    const machine = interpret(
      createIdentifyMachine({
        obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'token' },
        bootstrapData,
      }),
    );
    machine.start();
    return machine;
  };

  describe('with existing account', () => {
    it('successfully ids the user from email', () => {
      const machine = createMachine();

      let { state } = machine;
      expect(state.value).toEqual('init');

      state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(),
        },
      });
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          userFound: true,
          availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
          hasSyncablePassKey: true,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: true,
        successfulIdentifier: { email: 'belce@onefootprint.com' },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: true,
      });
      expect(state.value).toEqual('challenge');
    });

    it('successfully ids the user using phone number, after email mismatch, starts sms challenge', () => {
      const machine = createMachine();

      let { state } = machine;
      expect(state.value).toEqual('init');

      state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(),
        },
      });
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          userFound: false,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: false,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+16509878899',
          successfulIdentifier: { phoneNumber: '+16509878899' },
          userFound: true,
          availableChallengeKinds: [ChallengeKind.sms],
          hasSyncablePassKey: false,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        phoneNumber: '+16509878899',
        userFound: true,
        successfulIdentifier: { phoneNumber: '+16509878899' },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms],
        hasSyncablePassKey: false,
      });
      expect(state.value).toEqual('challenge');
    });

    it('successfully ids the user using phone number, after email mismatch, starts biometric challenge', () => {
      const machine = createMachine();

      let { state } = machine;
      expect(state.value).toEqual('init');

      state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(),
        },
      });
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          userFound: false,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: false,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+16509878899',
          successfulIdentifier: { phoneNumber: '+16509878899' },
          userFound: true,
          availableChallengeKinds: [ChallengeKind.sms],
          hasSyncablePassKey: false,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        phoneNumber: '+16509878899',
        userFound: true,
        successfulIdentifier: { phoneNumber: '+16509878899' },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms],
        hasSyncablePassKey: false,
      });
      expect(state.value).toEqual('challenge');

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          authToken: 'token',
        },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms],
        hasSyncablePassKey: false,
        authToken: 'token',
      });
      expect(state.value).toEqual('success');
    });
  });

  describe('with new user', () => {
    it('registers new phone', () => {
      const machine = createMachine();

      let { state } = machine;
      expect(state.value).toEqual('init');

      state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(),
        },
      });
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          userFound: false,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: false,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+16509878899',
          userFound: false,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        phoneNumber: '+16509878899',
        userFound: false,
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual('challenge');

      // Go back and change the phone number
      state = machine.send({
        type: 'navigatedToPrevPage',
      });
      expect(state.value).toEqual('phoneIdentification');

      state = machine.send({
        type: 'identified',
        payload: {
          phoneNumber: '+16509878899',
          userFound: false,
        },
      });
      expect(state.value).toEqual('challenge');
    });

    it('editing email while registering phone', () => {
      const machine = createMachine();

      let { state } = machine;
      expect(state.value).toEqual('init');

      state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(),
        },
      });
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          userFound: false,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: false,
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

  describe('biometric challenge', () => {
    it('successfully completes', () => {
      const machine = createMachine();
      let state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(),
        },
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          userFound: true,
          availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
          hasSyncablePassKey: true,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: true,
        successfulIdentifier: { email: 'belce@onefootprint.com' },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: true,
      });
      expect(state.value).toEqual('challenge');

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: true,
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });

    it('falls back to sms challenge', () => {
      const machine = createMachine();
      let state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(),
        },
      });
      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          userFound: true,
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
          hasSyncablePassKey: false,
        },
      });
      expect(state.value).toEqual('challenge');

      state = machine.send({
        type: 'challengeFailed',
      });

      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: true,
        successfulIdentifier: { email: 'belce@onefootprint.com' },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: false,
      });
      expect(state.value).toEqual('challenge');

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: false,
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });
  });

  describe('sms challenge', () => {
    it('successfully completes after resending the code', () => {
      const machine = createMachine();
      let { state } = machine;
      expect(state.value).toEqual('init');

      state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(),
        },
      });

      state = machine.send({
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          userFound: true,
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
          hasSyncablePassKey: true,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: true,
        successfulIdentifier: { email: 'belce@onefootprint.com' },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: true,
      });
      expect(state.value).toEqual('challenge');

      state = machine.send({
        type: 'challengeSucceeded',
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: true,
        authToken: 'authToken',
      });
      expect(state.value).toEqual('success');
    });
  });

  describe('in sandbox mode', () => {
    it('without bootstrap data', () => {
      const machine = createMachine();
      let { state } = machine;
      expect(state.value).toEqual('init');

      state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(false),
        },
      });
      expect(state.value).toEqual('sandboxOutcome');

      state = machine.send({
        type: 'sandboxOutcomeSubmitted',
        payload: {
          sandboxId: 'suffix',
        },
      });
      expect(state.value).toEqual('emailIdentification');
      expect(state.context.identify).toEqual({
        sandboxId: 'suffix',
      });
    });

    it('with bootstrap data', () => {
      const machine = createMachine({
        email: 'piip@onefootprint.com',
      });
      let { state } = machine;
      expect(state.value).toEqual('init');

      state = machine.send({
        type: 'initContextUpdated',
        payload: {
          device: getDevice(),
          config: getOnboardingConfig(false),
        },
      });
      expect(state.value).toEqual('sandboxOutcome');

      state = machine.send({
        type: 'sandboxOutcomeSubmitted',
        payload: {
          sandboxId: 'suffix',
        },
      });

      expect(state.value).toEqual('initBootstrap');
      expect(state.context.bootstrapData).toEqual({
        email: 'piip@onefootprint.com',
      });
      expect(state.context.identify).toEqual({
        sandboxId: 'suffix',
      });

      state = machine.send({
        type: 'identifyReset',
      });
      expect(state.context.identify).toEqual({
        sandboxId: 'suffix',
      });
    });
  });
});
