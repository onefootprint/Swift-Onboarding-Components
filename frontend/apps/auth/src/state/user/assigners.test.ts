import { ChallengeKind } from '@onefootprint/types';
import { describe, expect, it } from 'bun:test';

import {
  assignDecryptedData,
  assignEmail,
  assignEmailChallenge,
  assignEmailReplaceChallenge,
  assignKindToChallenge,
  assignPasskeyChallenge,
  assignPhoneChallenge,
  assignPhoneNumber,
  assignPhoneReplaceChallenge,
  assignUserDashboard,
  assignUserFound,
  assignVerifyToken,
} from './assigners';
import type { UserMachineContext } from './types';

const anyDate = new Date();

describe('should pass the entire payload', () => {
  it('assignEmail', () => {
    type Meta = Parameters<typeof assignEmail>['2'];
    const ctx = {} as UserMachineContext;
    const meta = {} as Meta;

    const result = assignEmail(
      ctx,
      { type: 'setEmail', payload: 'email' },
      meta,
    );

    expect(result.email).toEqual('email');
    expect(result.email).toEqual(ctx.email!);
  });

  it('assignPhoneNumber', () => {
    type Meta = Parameters<typeof assignPhoneNumber>['2'];
    const ctx = {} as UserMachineContext;
    const meta = {} as Meta;

    const result = assignPhoneNumber(
      ctx,
      { type: 'setPhoneNumber', payload: 'phone' },
      meta,
    );

    expect(result.phoneNumber).toEqual('phone');
    expect(result.phoneNumber).toEqual(ctx.phoneNumber!);
  });

  it('assignPhoneReplaceChallenge', () => {
    type Meta = Parameters<typeof assignPhoneReplaceChallenge>['2'];
    const ctx = {} as UserMachineContext;
    const data = {
      biometricChallengeJson: '',
      challengeToken: 'token',
      timeBeforeRetryS: 1,
    };
    const meta = {} as Meta;

    const { phoneReplaceChallenge } = assignPhoneReplaceChallenge(
      ctx,
      {
        type: 'setSmsReplaceChallenge',
        payload: { ...data, retryDisabledUntil: anyDate },
      },
      meta,
    );

    expect(phoneReplaceChallenge?.biometricChallengeJson).toEqual(
      data.biometricChallengeJson,
    );
    expect(phoneReplaceChallenge?.challengeToken).toEqual(data.challengeToken);
    expect(phoneReplaceChallenge?.timeBeforeRetryS).toEqual(
      data.timeBeforeRetryS,
    );
    expect(phoneReplaceChallenge).toEqual(ctx.phoneReplaceChallenge!);
  });

  it('assignEmailChallenge', () => {
    type Meta = Parameters<typeof assignEmailChallenge>['2'];
    const ctx = {} as UserMachineContext;
    const data = {
      challengeToken: 'token',
      challengeKind: ChallengeKind.email,
      scrubbedPhoneNumber: 'string',
      biometricChallengeJson: '',
      timeBeforeRetryS: 1,
    };
    const meta = {} as Meta;

    const result = assignEmailChallenge(
      ctx,
      {
        type: 'setEmailChallenge',
        payload: {
          biometricChallengeJson: '',
          challengeKind: ChallengeKind.email,
          challengeToken: 'token',
          scrubbedPhoneNumber: 'string',
          timeBeforeRetryS: 1,
        },
      },
      meta,
    );

    expect(result.emailChallenge).toEqual(data);
    expect(result.emailChallenge).toEqual(ctx.emailChallenge!);
  });

  it('assignEmailReplaceChallenge', () => {
    type Meta = Parameters<typeof assignEmailReplaceChallenge>['2'];
    const ctx = {} as UserMachineContext;
    const data = {
      biometricChallengeJson: '',
      challengeToken: 'token',
      timeBeforeRetryS: 1,
    };
    const meta = {} as Meta;

    const { emailReplaceChallenge } = assignEmailReplaceChallenge(
      ctx,
      {
        type: 'setEmailReplaceChallenge',
        payload: { ...data, retryDisabledUntil: anyDate },
      },
      meta,
    );

    expect(emailReplaceChallenge?.biometricChallengeJson).toEqual(
      data.biometricChallengeJson,
    );
    expect(emailReplaceChallenge?.challengeToken).toEqual(data.challengeToken);
    expect(emailReplaceChallenge?.timeBeforeRetryS).toEqual(
      data.timeBeforeRetryS,
    );
    expect(emailReplaceChallenge).toEqual(ctx.emailReplaceChallenge!);
  });

  it('assignKindToChallenge', () => {
    type Meta = Parameters<typeof assignKindToChallenge>['2'];
    const ctx = {} as UserMachineContext;
    const meta = {} as Meta;

    const result = assignKindToChallenge(
      ctx,
      { type: 'setChallengeKind', payload: ChallengeKind.sms },
      meta,
    );

    expect(result.kindToChallenge).toEqual(ChallengeKind.sms);
    expect(result.kindToChallenge).toEqual(ctx.kindToChallenge!);
  });

  it('assignPasskeyChallenge', () => {
    type Meta = Parameters<typeof assignPasskeyChallenge>['2'];
    const ctx = {} as UserMachineContext;
    const data = {
      biometricChallengeJson: 'biometricChallengeJson',
      challengeKind: ChallengeKind.biometric,
      challengeToken: 'token',
      scrubbedPhoneNumber: '',
      timeBeforeRetryS: 1,
    };
    const meta = {} as Meta;

    const result = assignPasskeyChallenge(
      ctx,
      { type: 'setPasskeyChallenge', payload: data },
      meta,
    );

    expect(result.passkeyChallenge).toEqual(data);
    expect(result.passkeyChallenge).toEqual(ctx.passkeyChallenge!);
  });

  it('assignVerifyToken', () => {
    type Meta = Parameters<typeof assignVerifyToken>['2'];
    const ctx = {} as UserMachineContext;
    const meta = {} as Meta;

    const result = assignVerifyToken(
      ctx,
      { type: 'setVerifyToken', payload: 'token' },
      meta,
    );

    expect(result.verifyToken).toEqual('token');
    expect(ctx.verifyToken).toEqual('token');
  });
});

describe('machine assigners', () => {
  it('should assign payload and replace asterisks to bullet: assignPhoneChallenge', () => {
    type Meta = Parameters<typeof assignPhoneChallenge>['2'];
    const ctx = {
      userDashboard: {
        email: { status: 'empty' },
        phone: { status: 'empty' },
        passkey: { status: 'empty' },
      },
    } as UserMachineContext;
    const meta = {} as Meta;

    const result = assignPhoneChallenge(
      ctx,
      {
        type: 'setPhoneChallenge',
        payload: {
          biometricChallengeJson: '',
          challengeKind: ChallengeKind.sms,
          challengeToken: 'token',
          scrubbedPhoneNumber: '1***',
          timeBeforeRetryS: 1,
        },
      },
      meta,
    );

    expect(result.phoneChallenge).toEqual({
      biometricChallengeJson: '',
      challengeKind: ChallengeKind.sms,
      challengeToken: 'token',
      scrubbedPhoneNumber: '1•••',
      timeBeforeRetryS: 1,
    });
    expect(result.phoneChallenge).toEqual(ctx.phoneChallenge!);
    expect(result.userDashboard?.phone?.label).toEqual('1•••');
  });

  it('should update dashboard entry: assignUserDashboard', () => {
    type Meta = Parameters<typeof assignUserDashboard>['2'];
    const ctx = {
      userDashboard: {
        email: { status: 'empty' },
        phone: { status: 'empty' },
        passkey: { status: 'empty' },
      },
    } as UserMachineContext;
    const meta = {} as Meta;

    const result = assignUserDashboard(
      ctx,
      {
        type: 'updateUserDashboard',
        payload: { kind: 'email', entry: { label: 'a@b.c', status: 'set' } },
      },
      meta,
    );

    expect(result.userDashboard).toEqual({
      email: { label: 'a@b.c', status: 'set' },
      passkey: { status: 'empty' },
      phone: { status: 'empty' },
    });
  });

  it('should assign decrypted data to user dashboard: assignDecryptedData', () => {
    type Meta = Parameters<typeof assignDecryptedData>['2'];
    const ctx = {
      userDashboard: {
        email: { status: 'empty' },
        phone: { status: 'empty' },
        passkey: { status: 'empty' },
      },
    } as UserMachineContext;
    const meta = {} as Meta;

    const result = assignDecryptedData(
      ctx,
      {
        type: 'decryptUserDone',
        payload: {
          'id.email': 'sandbox@onefootprint.com',
          'id.phone_number': '+15555550100',
        },
      },
      meta,
    );

    expect(result.userDashboard).toEqual({
      email: { label: 'sandbox@onefootprint.com', status: 'set' },
      passkey: { status: 'empty' },
      phone: { label: '+15555550100', status: 'set' },
    });
  });

  describe('assignUserFound', () => {
    it('should set values for kind, user dashboard and user found', () => {
      type Meta = Parameters<typeof assignUserFound>['2'];
      const ctx = {
        userDashboard: {
          email: { status: 'empty' },
          phone: { status: 'empty' },
          passkey: { status: 'empty' },
        },
      } as UserMachineContext;
      const meta = {} as Meta;

      const result = assignUserFound(
        ctx,
        {
          type: 'identifyUserDone',
          payload: {
            userFound: false,
            isUnverified: false,
            hasSyncablePassKey: false,
            availableChallengeKinds: [
              ChallengeKind.sms,
              ChallengeKind.email,
              ChallengeKind.biometric,
            ],
            scrubbedEmail: 'a*.g*.com',
            scrubbedPhone: '+49**',
          },
        },
        meta,
      );

      expect(result.kindToChallenge).toEqual(ChallengeKind.sms);
      expect(result.userDashboard?.email).toEqual({
        status: 'set',
        label: 'a•.g•.com',
      });
      expect(result.userDashboard?.phone).toEqual({
        status: 'set',
        label: '+49••',
      });
      expect(result.userDashboard?.passkey).toEqual({ status: 'set' });
      expect(result.userFound).toEqual({
        userFound: false,
        isUnverified: false,
        hasSyncablePassKey: false,
        availableChallengeKinds: [
          ChallengeKind.sms,
          ChallengeKind.email,
          ChallengeKind.biometric,
        ],
        scrubbedEmail: 'a•.g•.com',
        scrubbedPhone: '+49••',
      });
      expect(result.userFound).toEqual(ctx.userFound!);
    });

    it('should not assign phone when challenge is not available', () => {
      type Meta = Parameters<typeof assignUserFound>['2'];

      const ctx = {
        userDashboard: {
          email: { status: 'empty' },
          phone: { status: 'empty' },
          passkey: { status: 'empty' },
        },
      } as UserMachineContext;
      const meta = {} as Meta;

      const result = assignUserFound(
        ctx,
        {
          type: 'identifyUserDone',
          payload: {
            userFound: false,
            isUnverified: false,
            hasSyncablePassKey: false,
            availableChallengeKinds: [ChallengeKind.email],
            scrubbedEmail: 'a*.g*.com',
            scrubbedPhone: '+49**',
          },
        },
        meta,
      );

      expect(result.kindToChallenge).toEqual(ChallengeKind.email);
      expect(result.userDashboard?.email).toEqual({
        status: 'set',
        label: 'a•.g•.com',
      });
      expect(result.userDashboard?.phone).toEqual({ status: 'empty' });
    });
  });
});
