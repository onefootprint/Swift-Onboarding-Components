import { DeviceInfo } from 'footprint-ui/src/hooks/use-device-info/use-device-info.types';
import { interpret } from 'xstate';

import createIdentifyMachine from './machine';
import { ChallengeKind, Events, States } from './types';

describe('Identify Machine Tests', () => {
  const createMachine = (deviceInfo: DeviceInfo) =>
    createIdentifyMachine({
      device: deviceInfo,
    });

  describe('with existing account', () => {
    it('successfully ids the user from email', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebAuthn: true,
        }),
      );
      machine.start();
      let { state } = machine;
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebAuthn: true,
      });

      const challengeData = {
        challengeToken: 'token',
        challengeKind: ChallengeKind.sms,
        phoneNumberLastTwo: '00',
        phoneCountry: 'US',
      };
      state = machine.send({
        type: Events.emailIdentificationCompleted,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: true,
          challengeData,
        },
      });
      expect(state.context.email).toEqual('belce@onefootprint.com');
      expect(state.context.userFound).toEqual(true);
      expect(state.context.challengeData).toEqual(challengeData);
      expect(state.value).toEqual(States.phoneVerification);
    });

    it('successfully ids the user using phone number, after email mismatch', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebAuthn: true,
        }),
      );
      machine.start();
      let { state } = machine;
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebAuthn: true,
      });

      state = machine.send({
        type: Events.emailIdentificationCompleted,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: false,
        },
      });
      expect(state.context.email).toEqual('belce@onefootprint.com');
      expect(state.context.userFound).toEqual(false);
      expect(state.value).toEqual(States.phoneRegistration);

      const challengeData = {
        challengeToken: 'token',
        challengeKind: ChallengeKind.sms,
        phoneNumberLastTwo: '00',
        phoneCountry: 'US',
      };
      state = machine.send({
        type: Events.phoneIdentificationCompleted,
        payload: {
          phone: '+16509878899',
          userFound: true,
          email: 'belce.dogru@onefootprint.com',
          challengeData,
        },
      });
      // Email should be updated
      expect(state.context.email).toEqual('belce.dogru@onefootprint.com');
      expect(state.context.userFound).toEqual(true);
      expect(state.context.phone).toEqual('+16509878899');
      expect(state.context.challengeData).toEqual(challengeData);
      expect(state.value).toEqual(States.phoneVerification);
    });
  });

  describe('with new user', () => {
    it('registers new phone', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebAuthn: true,
        }),
      );
      machine.start();
      let { state } = machine;
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebAuthn: true,
      });

      state = machine.send({
        type: Events.emailIdentificationCompleted,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: false,
        },
      });
      expect(state.context.email).toEqual('belce@onefootprint.com');
      expect(state.context.userFound).toEqual(false);
      expect(state.value).toEqual(States.phoneRegistration);

      state = machine.send({
        type: Events.phoneIdentificationCompleted,
        payload: {
          phone: '+16509878899',
          userFound: false,
          email: 'belce.dogru@onefootprint.com',
        },
      });
      // Email should be updated
      expect(state.context.email).toEqual('belce.dogru@onefootprint.com');
      expect(state.context.userFound).toEqual(false);
      expect(state.context.phone).toEqual('+16509878899');
      expect(state.value).toEqual(States.phoneVerification);

      // Go back and change the phone number
      state = machine.send({
        type: Events.navigatedToPrevPage,
      });
      expect(state.value).toEqual(States.phoneRegistration);

      state = machine.send({
        type: Events.phoneIdentificationCompleted,
        payload: {
          phone: '+16501111111',
          userFound: true,
          email: 'someone@onefootprint.com',
        },
      });
      expect(state.context.email).toEqual('someone@onefootprint.com');
      expect(state.context.userFound).toEqual(true);
      expect(state.context.phone).toEqual('+16501111111');
      expect(state.value).toEqual(States.phoneVerification);
    });

    it('editing email while registering phone', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebAuthn: true,
        }),
      );
      machine.start();
      let { state } = machine;
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.device).toEqual({
        type: 'mobile',
        hasSupportForWebAuthn: true,
      });

      state = machine.send({
        type: Events.emailIdentificationCompleted,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: false,
        },
      });
      expect(state.context.email).toEqual('belce@onefootprint.com');
      expect(state.context.userFound).toEqual(false);
      expect(state.value).toEqual(States.phoneRegistration);

      // Edit the email address
      state = machine.send({
        type: Events.emailChangeRequested,
      });
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.email).toEqual(undefined);
      expect(state.context.userFound).toEqual(false);
    });
  });

  describe('biometric challenge', () => {
    it('successfully completes', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebAuthn: true,
        }),
      );
      machine.start();

      let state = machine.send({
        type: Events.emailIdentificationCompleted,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: true,
        },
      });
      expect(state.value).toEqual(States.emailIdentification);

      state = machine.send({
        type: Events.biometricLoginSucceeded,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.authToken).toEqual('authToken');
      expect(state.value).toEqual(States.success);
    });

    it('falls back to sms challenge', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebAuthn: true,
        }),
      );
      machine.start();

      const biometricChallenge = {
        challengeToken: 'token',
        challengeKind: ChallengeKind.biometric,
        biometricChallengeJson: '',
      };
      let state = machine.send({
        type: Events.emailIdentificationCompleted,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: true,
          challengeData: biometricChallenge,
        },
      });
      expect(state.value).toEqual(States.emailIdentification);
      expect(state.context.challengeData).toEqual(biometricChallenge);

      state = machine.send({
        type: Events.biometricLoginFailed,
      });
      expect(state.value).toEqual(States.biometricLoginRetry);

      const smsChallenge = {
        challengeToken: 'token',
        challengeKind: ChallengeKind.sms,
        phoneNumberLastTwo: '00',
        phoneCountry: 'US',
      };
      state = machine.send({
        type: Events.smsChallengeInitiated,
        payload: {
          challengeData: smsChallenge,
        },
      });
      expect(state.context.challengeData).toEqual(smsChallenge);
      expect(state.value).toEqual(States.phoneVerification);

      state = machine.send({
        type: Events.smsChallengeSucceeded,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.authToken).toEqual('authToken');
      expect(state.value).toEqual(States.success);
    });
  });

  describe('sms challenge', () => {
    it('successfully completes after resending the code', () => {
      const machine = interpret(
        createMachine({
          type: 'mobile',
          hasSupportForWebAuthn: true,
        }),
      );
      machine.start();

      const smsChallenge1 = {
        challengeToken: 'token',
        challengeKind: ChallengeKind.sms,
        phoneNumberLastTwo: '00',
        phoneCountry: 'US',
      };
      let state = machine.send({
        type: Events.emailIdentificationCompleted,
        payload: {
          email: 'belce@onefootprint.com',
          userFound: true,
          challengeData: smsChallenge1,
        },
      });
      expect(state.value).toEqual(States.phoneVerification);
      expect(state.context.challengeData).toEqual(smsChallenge1);

      const smsChallenge2 = {
        challengeToken: 'token2',
        challengeKind: ChallengeKind.sms,
        phoneNumberLastTwo: '00',
        phoneCountry: 'US',
      };
      state = machine.send({
        type: Events.smsChallengeResent,
        payload: {
          challengeData: smsChallenge2,
        },
      });
      expect(state.value).toEqual(States.phoneVerification);
      expect(state.context.challengeData).toEqual(smsChallenge2);

      state = machine.send({
        type: Events.smsChallengeSucceeded,
        payload: {
          authToken: 'authToken',
        },
      });
      expect(state.context.authToken).toEqual('authToken');
      expect(state.value).toEqual(States.success);
    });
  });
});
