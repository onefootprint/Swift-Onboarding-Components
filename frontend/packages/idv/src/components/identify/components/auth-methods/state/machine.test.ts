import { interpret } from 'xstate';

import { UserChallengeActionKind } from '@onefootprint/types';
import type { DeviceInfo } from '../../../../../hooks/use-device-info';
import createAuthMethodsMachine from './machine';

const fixtureDeviceInfo = {
  browser: 'browser',
  osName: 'osName',
  type: 'desktop',
  hasSupportForWebauthn: true,
  initialCameraPermissionState: 'denied',
} satisfies DeviceInfo;

describe('createAuthMethodsMachine', () => {
  it('should navigate to the email flow', () => {
    const machine = interpret(
      createAuthMethodsMachine({
        authToken: 'tok_initial',
        initialMachineState: 'identify',
      }),
    );
    machine.start();

    let state = machine.send([{ type: 'setVerifyToken', payload: 'tok_from_identify' }]);
    expect(state.value).toBe('dashboard');
    expect(state.context.authToken).toBe('tok_initial');
    expect(state.context.verifyToken).toBe('tok_from_identify');

    state = machine.send([{ type: 'updateEmail', payload: UserChallengeActionKind.addPrimary }]);
    expect(state.value).toBe('updateEmail');
    expect(state.context.updateMethod).toBe('add_primary');

    state = machine.send([{ type: 'goToBack' }]);
    expect(state.value).toBe('dashboard');

    state = machine.send([{ type: 'updateEmail', payload: UserChallengeActionKind.replace }]);
    expect(state.value).toBe('updateEmail');
    expect(state.context.updateMethod).toBe('replace');

    state = machine.send([
      {
        type: 'updateUserDashboard',
        payload: {
          kind: 'email',
          entry: { label: 'new@email.com', status: 'set' },
        },
      },
    ]);
    expect(state.value).toBe('dashboard');
    expect(state.context.userDashboard).toEqual({
      email: { label: 'new@email.com', status: 'set' },
      passkey: { status: 'empty' },
      phone: { status: 'empty' },
    });

    machine.stop();
  });

  it('should navigate to the phone flow', () => {
    const machine = interpret(
      createAuthMethodsMachine({
        authToken: 'tok_initial',
        initialMachineState: 'identify',
      }),
    );
    machine.start();

    let state = machine.send([{ type: 'setVerifyToken', payload: 'tok_from_identify' }]);
    expect(state.value).toBe('dashboard');
    expect(state.context.authToken).toBe('tok_initial');
    expect(state.context.verifyToken).toBe('tok_from_identify');

    state = machine.send([{ type: 'updatePhone', payload: UserChallengeActionKind.addPrimary }]);
    expect(state.value).toBe('updatePhone');
    expect(state.context.updateMethod).toBe('add_primary');

    state = machine.send([{ type: 'goToBack' }]);
    expect(state.value).toBe('dashboard');

    state = machine.send([{ type: 'updatePhone', payload: UserChallengeActionKind.replace }]);
    expect(state.value).toBe('updatePhone');
    expect(state.context.updateMethod).toBe('replace');

    state = machine.send([
      {
        type: 'updateUserDashboard',
        payload: {
          kind: 'phone',
          entry: { label: '+123', status: 'set' },
        },
      },
    ]);
    expect(state.value).toBe('dashboard');
    expect(state.context.userDashboard).toEqual({
      phone: { label: '+123', status: 'set' },
      passkey: { status: 'empty' },
      email: { status: 'empty' },
    });

    machine.stop();
  });

  it('should navigate to the passkey flow', () => {
    const machine = interpret(
      createAuthMethodsMachine({
        authToken: 'tok_initial',
        initialMachineState: 'identify',
      }),
    );
    machine.start();

    let state = machine.send([{ type: 'setVerifyToken', payload: 'tok_from_identify' }]);
    expect(state.value).toBe('dashboard');
    expect(state.context.authToken).toBe('tok_initial');
    expect(state.context.verifyToken).toBe('tok_from_identify');

    state = machine.send([{ type: 'updatePasskey', payload: UserChallengeActionKind.addPrimary }]);
    expect(state.value).toBe('updatePasskey');
    expect(state.context.updateMethod).toBe('add_primary');

    state = machine.send([{ type: 'goToBack' }]);
    expect(state.value).toBe('dashboard');

    state = machine.send([{ type: 'updatePasskey', payload: UserChallengeActionKind.replace }]);
    expect(state.value).toBe('updatePasskey');
    expect(state.context.updateMethod).toBe('replace');

    state = machine.send([
      {
        type: 'updateUserDashboard',
        payload: {
          kind: 'passkey',
          entry: { label: 'new passkey', status: 'set' },
        },
      },
    ]);
    expect(state.value).toBe('dashboard');
    expect(state.context.userDashboard).toEqual({
      passkey: { label: 'new passkey', status: 'set' },
      phone: { status: 'empty' },
      email: { status: 'empty' },
    });

    machine.stop();
  });

  it('should perform machine actions and stay in the same state "dashboard"', () => {
    const machine = interpret(
      createAuthMethodsMachine({
        authToken: 'tok_initial',
        initialMachineState: 'identify',
      }),
    );
    machine.start();

    let state = machine.send([{ type: 'setVerifyToken', payload: 'tok_from_identify' }]);
    expect(state.value).toBe('dashboard');
    expect(state.context.authToken).toBe('tok_initial');
    expect(state.context.verifyToken).toBe('tok_from_identify');

    state = machine.send([
      {
        type: 'decryptUserDone',
        payload: {
          'id.email': 'user@email.com',
          'id.phone_number': '+15555550100',
        },
      },
    ]);
    expect(state.value).toBe('dashboard');
    expect(state.context.userDashboard).toEqual({
      email: { label: 'user@email.com', status: 'set' },
      phone: { label: '+15555550100', status: 'set' },
      passkey: { status: 'empty' },
    });

    state = machine.send([
      {
        type: 'updateUserDashboard',
        payload: { kind: 'passkey', entry: { status: 'set' } },
      },
    ]);
    expect(state.value).toBe('dashboard');
    expect(state.context.userDashboard).toEqual({
      email: { label: 'user@email.com', status: 'set' },
      phone: { label: '+15555550100', status: 'set' },
      passkey: { status: 'set' },
    });

    state = machine.send([
      {
        type: 'setDevice',
        payload: fixtureDeviceInfo,
      },
    ]);
    expect(state.value).toBe('dashboard');
    expect(state.context.device).toEqual(fixtureDeviceInfo);

    machine.stop();
  });
});
