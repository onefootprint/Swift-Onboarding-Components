import type { AuthMethodKind } from '@onefootprint/types';
import type { Assigner } from 'xstate';

import { isObject, isString } from '../../../../../utils';
import type { AuthMethodsMachineEvents as Events, AuthMethodsMachineContext as MachineContext } from './types';

type Obj = Record<string, unknown>;
type MCtx<T extends Events> = Assigner<MachineContext, T>;
type MEvent<T, U> = T extends { type: U; payload: infer P } ? { type: U; payload: P } : never;

type DecryptUserDone = MCtx<MEvent<Events, 'decryptUserDone'>>;
type SetVerifyToken = MCtx<MEvent<Events, 'setVerifyToken'>>;
type SetDevice = MCtx<MEvent<Events, 'setDevice'>>;
type UpdateUserDashboard = MCtx<MEvent<Events, 'updateUserDashboard'>>;
type UpdateMethodActionKind = MCtx<MEvent<Events, 'updateEmail' | 'updatePhone' | 'updatePasskey'>>;

const getIdValue = (key: string, obj: Obj): string | undefined =>
  isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key) && isString(obj[key])
    ? (obj[key] as string)
    : undefined;

const assignVerifyToken: SetVerifyToken = (ctx, { payload }) => {
  ctx.verifyToken = payload;
  return ctx;
};

const assignUserDashboard: UpdateUserDashboard = (ctx, { payload }) => {
  const validAuthMethodsKinds: `${AuthMethodKind}`[] = ['email', 'phone', 'passkey'];
  if (!validAuthMethodsKinds.includes(payload.kind)) return ctx;

  const dashboard = { ...ctx.userDashboard };
  const { entry, kind } = payload;

  if (entry && kind) {
    dashboard[kind] = { ...dashboard[kind], ...entry };
  }

  ctx.userDashboard = dashboard;

  return ctx;
};

const assignDecryptedData: DecryptUserDone = (ctx, { payload }) => {
  const labelEmail = getIdValue('id.email', payload);
  const labelPhone = getIdValue('id.phone_number', payload);

  ctx.userDashboard = {
    ...ctx.userDashboard,
    email: labelEmail ? { status: 'set', label: labelEmail } : ctx.userDashboard.email,
    phone: labelPhone ? { status: 'set', label: labelPhone } : ctx.userDashboard.phone,
  };

  return ctx;
};

const assignUpdateMethod: UpdateMethodActionKind = (ctx, { payload }) => {
  ctx.updateMethod = payload;
  return ctx;
};

const assignDevice: SetDevice = (ctx, { payload }) => {
  ctx.device = payload;
  return ctx;
};

export { assignDecryptedData, assignDevice, assignUpdateMethod, assignUserDashboard, assignVerifyToken };
