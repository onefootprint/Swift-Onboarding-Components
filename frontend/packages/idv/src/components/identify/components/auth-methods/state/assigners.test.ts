import { AuthMethodKind } from '@onefootprint/types';

import { assignDecryptedData, assignUserDashboard, assignVerifyToken } from './assigners';
import type { AuthMethodsMachineContext as MachineContext } from './types';

const emptyUserDashboard = {
  [AuthMethodKind.email]: { status: 'empty' },
  [AuthMethodKind.phone]: { status: 'empty' },
  [AuthMethodKind.passkey]: { status: 'empty' },
};

describe('should pass the entire payload', () => {
  it('assignVerifyToken', () => {
    type Meta = Parameters<typeof assignVerifyToken>['2'];
    const ctx = {} as MachineContext;
    const meta = {} as Meta;

    const result = assignVerifyToken(ctx, { type: 'setVerifyToken', payload: 'token' }, meta);

    expect(result.verifyToken).toEqual('token');
    expect(ctx.verifyToken).toEqual('token');
  });
});

describe('assignUserDashboard', () => {
  type Meta = Parameters<typeof assignUserDashboard>['2'];
  const meta = {} as Meta;

  it('should update email entry in dashboard', () => {
    const ctx = { userDashboard: emptyUserDashboard } as MachineContext;
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

  it('should update email entry in dashboard', () => {
    const ctx = { userDashboard: emptyUserDashboard } as MachineContext;
    const result = assignUserDashboard(
      ctx,
      {
        type: 'updateUserDashboard',
        payload: { kind: 'phone', entry: { label: '+123', status: 'set' } },
      },
      meta,
    );

    expect(result.userDashboard).toEqual({
      phone: { label: '+123', status: 'set' },
      passkey: { status: 'empty' },
      email: { status: 'empty' },
    });
  });

  it('should update passkey entry in dashboard', () => {
    const ctx = { userDashboard: emptyUserDashboard } as MachineContext;
    const result = assignUserDashboard(
      ctx,
      {
        type: 'updateUserDashboard',
        payload: { kind: 'passkey', entry: { label: 'Passkey', status: 'set' } },
      },
      meta,
    );

    expect(result.userDashboard).toEqual({
      phone: { status: 'empty' },
      passkey: { label: 'Passkey', status: 'set' },
      email: { status: 'empty' },
    });
  });

  it('should not update any entry in dashboard, when the payload is invalid', () => {
    const ctx = { userDashboard: emptyUserDashboard } as MachineContext;
    const result = assignUserDashboard(
      ctx,
      {
        type: 'updateUserDashboard',
        // @ts-expect-error: Intentional invalid entry
        payload: { kind: 'invalid', entry: { label: 'String', status: 'set' } },
      },
      meta,
    );

    expect(result.userDashboard).toEqual({
      phone: { status: 'empty' },
      passkey: { status: 'empty' },
      email: { status: 'empty' },
    });
  });
});

describe('assignDecryptedData', () => {
  it('should assign decrypted data to user dashboard', () => {
    type Meta = Parameters<typeof assignDecryptedData>['2'];
    const ctx = { userDashboard: emptyUserDashboard } as MachineContext;
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
      [AuthMethodKind.email]: { label: 'sandbox@onefootprint.com', status: 'set' },
      [AuthMethodKind.passkey]: { status: 'empty' },
      [AuthMethodKind.phone]: { label: '+15555550100', status: 'set' },
    });
  });

  it('should ignore non auth methods properties', () => {
    type Meta = Parameters<typeof assignDecryptedData>['2'];
    const ctx = { userDashboard: emptyUserDashboard } as MachineContext;
    const meta = {} as Meta;

    const result = assignDecryptedData(
      ctx,
      {
        type: 'decryptUserDone',
        payload: {
          'id.first_name': 'Jack',
          'id.last_name': 'Jones',
        },
      },
      meta,
    );

    expect(result.userDashboard).toEqual({
      [AuthMethodKind.email]: { status: 'empty' },
      [AuthMethodKind.passkey]: { status: 'empty' },
      [AuthMethodKind.phone]: { status: 'empty' },
    });
  });
});
