import { AuthMethodKind } from '@onefootprint/types';

import { assignDecryptedData, assignUserDashboard, assignVerifyToken } from './assigners';
import type { AuthMethodsMachineContext as MachineContext } from './types';

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

describe('machine assigners', () => {
  it('should update dashboard entry: assignUserDashboard', () => {
    type Meta = Parameters<typeof assignUserDashboard>['2'];
    const ctx = {
      userDashboard: {
        [AuthMethodKind.email]: { status: 'empty' },
        [AuthMethodKind.phone]: { status: 'empty' },
        [AuthMethodKind.passkey]: { status: 'empty' },
      },
    } as MachineContext;
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
        [AuthMethodKind.email]: { status: 'empty' },
        [AuthMethodKind.phone]: { status: 'empty' },
        [AuthMethodKind.passkey]: { status: 'empty' },
      },
    } as MachineContext;
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
      [AuthMethodKind.email]: {
        label: 'sandbox@onefootprint.com',
        status: 'set',
      },
      [AuthMethodKind.passkey]: { status: 'empty' },
      [AuthMethodKind.phone]: { label: '+15555550100', status: 'set' },
    });
  });
});
