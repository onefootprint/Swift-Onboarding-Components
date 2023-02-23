import { DeviceInfo } from '@onefootprint/hooks';
import {
  ChallengeKind,
  CollectedKycDataOption,
  OnboardingConfig,
} from '@onefootprint/types';
import { interpret } from 'xstate';

import createIdentifyMachine from './machine';
import { Events, States } from './types';

describe('Identify Machine Tests', () => {
  const getOnboardingConfig = (isLive?: boolean): OnboardingConfig => ({
    isLive: isLive ?? true,
    createdAt: 'date',
    id: 'id',
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: 'enabled',
    mustCollectData: [CollectedKycDataOption.name],
    mustCollectIdentityDocument: false,
    mustCollectSelfie: false,
    canAccessData: [CollectedKycDataOption.name],
    canAccessIdentityDocumentImages: false,
    canAccessSelfieImage: false,
  });

  const createMachine = (deviceInfo: DeviceInfo, identifierSuffix?: string) =>
    createIdentifyMachine({
      device: deviceInfo,
      config: getOnboardingConfig(),
      identifierSuffix,
    });

  describe('with existing account', () => {
    it('successfully ids the user from email', () => {
      const machine = interpret(
        createMachine(
          {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
          '#test1',
        ),
      );
      machine.start();
      let { state } = machine;
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: Events.identified,
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
        identifierSuffix: '#test1',
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: true,
      });
      expect(state.value).toEqual(States.emailIdentification);
    });

    it('successfully ids the user using phone number, after email mismatch, starts sms challenge', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebauthn: true,
        }),
      );
      machine.start();
      let { state } = machine;
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: Events.identified,
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
      expect(state.value).toEqual(States.phoneRegistration);

      state = machine.send({
        type: Events.identified,
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
      expect(state.value).toEqual(States.phoneRegistration);

      const challengeData = {
        challengeToken: 'token',
        challengeKind: ChallengeKind.sms,
        scrubbedPhoneNumber: '+1 (***) ***-**00',
      };
      state = machine.send({
        type: Events.challengeInitiated,
        payload: { challengeData },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms],
        hasSyncablePassKey: false,
        challengeData,
      });
      expect(state.value).toEqual(States.phoneVerification);
    });

    it('successfully ids the user using phone number, after email mismatch, starts biometric challenge', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebauthn: true,
        }),
      );
      machine.start();
      let { state } = machine;
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: Events.identified,
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
      expect(state.value).toEqual(States.phoneRegistration);

      state = machine.send({
        type: Events.identified,
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
      expect(state.value).toEqual(States.phoneRegistration);

      state = machine.send({
        type: Events.challengeSucceeded,
        payload: {
          authToken: 'token',
        },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms],
        hasSyncablePassKey: false,
        authToken: 'token',
      });
      expect(state.value).toEqual(States.success);
    });
  });

  describe('with new user', () => {
    it('registers new phone', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebauthn: true,
        }),
      );
      machine.start();
      let { state } = machine;
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: Events.identified,
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
      expect(state.value).toEqual(States.phoneRegistration);

      state = machine.send({
        type: Events.identified,
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
      expect(state.value).toEqual(States.phoneRegistration);

      const challengeData = {
        challengeToken: 'token',
        challengeKind: ChallengeKind.sms,
        scrubbedPhoneNumber: '+1 (***) ***-**00',
      };
      state = machine.send({
        type: Events.challengeInitiated,
        payload: {
          challengeData,
        },
      });
      expect(state.context.challenge).toEqual({
        challengeData,
      });
      expect(state.value).toEqual(States.phoneVerification);

      // Go back and change the phone number
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.phoneRegistration);

      state = machine.send({
        type: Events.challengeInitiated,
        payload: {
          challengeData,
        },
      });
      expect(state.context.challenge).toEqual({
        challengeData,
      });
      expect(state.value).toEqual(States.phoneVerification);
    });

    it('editing email while registering phone', () => {
      const machine = interpret(
        createMachine(
          {
            type: 'mobile',
            hasSupportForWebauthn: true,
          },
          '#test1',
        ),
      );
      machine.start();
      let { state } = machine;
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebauthn: true,
      });

      state = machine.send({
        type: Events.identified,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: false,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: false,
        identifierSuffix: '#test1',
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual(States.phoneRegistration);

      // Edit the email address
      state = machine.send({
        type: Events.identifyReset,
      });
      expect(state.context.identify).toEqual({
        identifierSuffix: '#test1',
      });
      expect(state.context.challenge).toEqual({});
      expect(state.value).toEqual(States.emailIdentification);
    });
  });

  describe('biometric challenge', () => {
    it('successfully completes', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebauthn: true,
        }),
      );
      machine.start();

      let state = machine.send({
        type: Events.identified,
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
      expect(state.value).toEqual(States.emailIdentification);

      state = machine.send({
        type: Events.challengeSucceeded,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: true,
        authToken: 'authToken',
      });
      expect(state.value).toEqual(States.success);
    });

    it('falls back to sms challenge', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebauthn: true,
        }),
      );
      machine.start();

      let state = machine.send({
        type: Events.identified,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: true,
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
          hasSyncablePassKey: false,
        },
      });
      expect(state.value).toEqual(States.emailIdentification);

      state = machine.send({
        type: Events.challengeFailed,
      });
      expect(state.value).toEqual(States.biometricLoginRetry);

      const smsChallenge = {
        challengeToken: 'token',
        challengeKind: ChallengeKind.sms,
        scrubbedPhoneNumber: '+1 (***) ***-**00',
      };
      state = machine.send({
        type: Events.challengeInitiated,
        payload: {
          challengeData: smsChallenge,
        },
      });
      expect(state.context.identify).toEqual({
        email: 'belce@onefootprint.com',
        userFound: true,
        successfulIdentifier: { email: 'belce@onefootprint.com' },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: false,
        challengeData: smsChallenge,
      });
      expect(state.value).toEqual(States.phoneVerification);

      state = machine.send({
        type: Events.challengeSucceeded,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: false,
        challengeData: smsChallenge,
        authToken: 'authToken',
      });
      expect(state.value).toEqual(States.success);
    });
  });

  describe('sms challenge', () => {
    it('successfully completes after resending the code', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebauthn: true,
        }),
      );
      machine.start();

      let state = machine.send({
        type: Events.identified,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: true,
          successfulIdentifier: { email: 'belce@onefootprint.com' },
          availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
          hasSyncablePassKey: true,
        },
      });
      expect(state.value).toEqual(States.emailIdentification);

      const smsChallenge1 = {
        challengeToken: 'token',
        challengeKind: ChallengeKind.sms,
        scrubbedPhoneNumber: '+1 (***) ***-**00',
      };
      state = machine.send({
        type: Events.challengeInitiated,
        payload: {
          challengeData: smsChallenge1,
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
        challengeData: smsChallenge1,
      });
      expect(state.value).toEqual(States.phoneVerification);

      const smsChallenge2 = {
        challengeToken: 'token2',
        challengeKind: ChallengeKind.sms,
        scrubbedPhoneNumber: '+1 (***) ***-**00',
        retryDisabledUntil: new Date('Aug 07 2022 18:00:00'),
      };
      state = machine.send({
        type: Events.challengeInitiated,
        payload: {
          challengeData: smsChallenge2,
        },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: true,
        challengeData: smsChallenge2,
      });
      expect(state.value).toEqual(States.phoneVerification);

      state = machine.send({
        type: Events.challengeSucceeded,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.challenge).toEqual({
        availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        hasSyncablePassKey: true,
        challengeData: smsChallenge2,
        authToken: 'authToken',
      });
      expect(state.value).toEqual(States.success);
    });
  });
});
