import { describe, expect, it } from 'bun:test';

import {
  assignDecryptedData,
  assignEmail,
  assignPhoneNumber,
  assignUserDashboard,
  assignVerifyToken,
} from './assigners';
import type { UserMachineContext } from './types';

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
});
