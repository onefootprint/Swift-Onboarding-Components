import type {
  IdentifyBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import {
  ChallengeKind,
  CLIENT_PUBLIC_KEY_HEADER,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import createIdentifyMachine from './machine';

describe('Identify Machine Tests', () => {
  const getOnboardingConfig = (isLive = true): PublicOnboardingConfig => ({
    isLive,
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: OnboardingConfigStatus.enabled,
    isAppClipEnabled: false,
    isInstantAppEnabled: false,
    appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
    isNoPhoneFlow: false,
    requiresIdDoc: false,
    key: 'key',
    isKyb: false,
    allowInternationalResidents: false,
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
        device: getDevice(),
        config: getOnboardingConfig(),
      }),
    );
    machine.start();
    return machine;
  };

  describe('with existing account', () => {
    it('successfully ids the user from email', () => {
      const machine = createMachine();

      let { state } = machine;
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
      expect(state.value).toEqual('biometricChallenge');
    });

    it('successfully ids the user using phone number, after email mismatch, starts sms challenge', () => {
      const machine = createMachine();

      let { state } = machine;
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
      expect(state.value).toEqual('smsChallenge');
    });

    it('successfully ids the user using phone number, after email mismatch, starts biometric challenge', () => {
      const machine = createMachine();

      let { state } = machine;
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
      expect(state.value).toEqual('smsChallenge');

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
          userFound: false,
        },
      });
      expect(state.value).toEqual('smsChallenge');
    });

    it('editing email while registering phone', () => {
      const machine = createMachine();

      let { state } = machine;
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
      expect(state.value).toEqual('biometricChallenge');

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
        type: 'identified',
        payload: {
          email: 'belce@onefootprint.com',
          userFound: true,
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
          hasSyncablePassKey: false,
        },
      });
      expect(state.value).toEqual('biometricChallenge');

      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: true,
        successfulIdentifier: { email: 'belce@onefootprint.com' },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: false,
      });

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
      expect(state.value).toEqual('biometricChallenge');

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
});
