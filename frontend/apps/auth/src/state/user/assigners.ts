import type { Assigner } from 'xstate';

import { isObject, isString } from '@/src/utils';

import type { UserMachineContext, UserMachineEvents as Events } from './types';

type Obj = Record<string, unknown>;
type MCtx<T extends Events> = Assigner<UserMachineContext, T>;
type MEvent<T, U> = T extends { type: U; payload: infer P }
  ? { type: U; payload: P }
  : never;

type DecryptUserDone = MCtx<MEvent<Events, 'decryptUserDone'>>;
type SetVerifyToken = MCtx<MEvent<Events, 'setVerifyToken'>>;
type UpdateUserDashboard = MCtx<MEvent<Events, 'updateUserDashboard'>>;

const getIdValue = (key: string, obj: Obj): string | undefined =>
  isObject(obj) &&
  Object.prototype.hasOwnProperty.call(obj, key) &&
  isString(obj[key])
    ? (obj[key] as string)
    : undefined;

const assignVerifyToken: SetVerifyToken = (ctx, { payload }) => {
  ctx.verifyToken = payload;
  return ctx;
};

const assignUserDashboard: UpdateUserDashboard = (ctx, { payload }) => {
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
    email: labelEmail
      ? { status: 'set', label: labelEmail }
      : ctx.userDashboard.email,
    phone: labelPhone
      ? { status: 'set', label: labelPhone }
      : ctx.userDashboard.phone,
  };

  return ctx;
};

export { assignDecryptedData, assignUserDashboard, assignVerifyToken };
