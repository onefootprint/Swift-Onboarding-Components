import type { Assigner } from 'xstate';

import {
  isBiometricOrPasskey,
  isEmail,
  isObject,
  isSmsOrPhone,
  isString,
} from '@/src/utils';

import type { UserMachineContext, UserMachineEvents as Events } from './types';

type Obj = Record<string, unknown>;
type MCtx<T extends Events> = Assigner<UserMachineContext, T>;
type MEvent<T, U> = T extends { type: U; payload: infer P }
  ? { type: U; payload: P }
  : never;

type DecryptUserDone = MCtx<MEvent<Events, 'decryptUserDone'>>;
type IdentifyUserDone = MCtx<MEvent<Events, 'identifyUserDone'>>;
type SetChallengeKind = MCtx<MEvent<Events, 'setChallengeKind'>>;
type SetEmail = MCtx<MEvent<Events, 'setEmail'>>;
type SetEmailChallenge = MCtx<MEvent<Events, 'setEmailChallenge'>>;
type SetEmailRepChallenge = MCtx<MEvent<Events, 'setEmailReplaceChallenge'>>;
type SetPasskeyChallenge = MCtx<MEvent<Events, 'setPasskeyChallenge'>>;
type SetPhoneChallenge = MCtx<MEvent<Events, 'setPhoneChallenge'>>;
type SetPhoneNumber = MCtx<MEvent<Events, 'setPhoneNumber'>>;
type SetSmsReplaceChallenge = MCtx<MEvent<Events, 'setSmsReplaceChallenge'>>;
type SetVerifyToken = MCtx<MEvent<Events, 'setVerifyToken'>>;
type UpdateUserDashboard = MCtx<MEvent<Events, 'updateUserDashboard'>>;

const asterisksToBullet = (str?: string): string =>
  (str || '').replace(/\*/g, '•');

const getIdValue = (key: string, obj: Obj): string | undefined =>
  isObject(obj) &&
  Object.prototype.hasOwnProperty.call(obj, key) &&
  isString(obj[key])
    ? (obj[key] as string)
    : undefined;

const assignEmail: SetEmail = (ctx, { payload }) => {
  ctx.email = payload;
  return ctx;
};

const assignEmailChallenge: SetEmailChallenge = (ctx, { payload }) => {
  ctx.emailChallenge = payload;
  return ctx;
};

const assignEmailReplaceChallenge: SetEmailRepChallenge = (
  ctx,
  { payload },
) => {
  ctx.emailReplaceChallenge = payload;
  return ctx;
};

const assignKindToChallenge: SetChallengeKind = (ctx, { payload }) => {
  ctx.kindToChallenge = payload;
  return ctx;
};

const assignPasskeyChallenge: SetPasskeyChallenge = (ctx, { payload }) => {
  ctx.passkeyChallenge = payload;
  return ctx;
};

const assignPhoneNumber: SetPhoneNumber = (ctx, { payload }) => {
  ctx.phoneNumber = payload;
  return ctx;
};

const assignPhoneReplaceChallenge: SetSmsReplaceChallenge = (
  ctx,
  { payload },
) => {
  ctx.phoneReplaceChallenge = payload;
  return ctx;
};

const assignPhoneChallenge: SetPhoneChallenge = (ctx, { payload }) => {
  const phoneNumber = asterisksToBullet(payload.scrubbedPhoneNumber);

  if (ctx.userDashboard.phone) {
    ctx.userDashboard = {
      ...ctx.userDashboard,
      phone: {
        ...ctx.userDashboard.phone,
        label: phoneNumber,
      },
    };
  }

  ctx.phoneChallenge = {
    ...payload,
    scrubbedPhoneNumber: phoneNumber,
  };

  return ctx;
};

const assignUserFound: IdentifyUserDone = (ctx, { payload }) => {
  const dashboard = { ...ctx.userDashboard };
  const kinds = payload.availableChallengeKinds;
  const scrubbedEmail = asterisksToBullet(payload.scrubbedEmail);
  const scrubbedPhone = asterisksToBullet(payload.scrubbedPhone);

  if (kinds?.some(isSmsOrPhone)) {
    dashboard.phone = { status: 'set', label: scrubbedPhone };
  }
  if (kinds?.some(isEmail)) {
    dashboard.email = { status: 'set', label: scrubbedEmail };
  }
  if (kinds?.some(isBiometricOrPasskey)) {
    dashboard.passkey = { ...dashboard.passkey, status: 'set' };
  }

  ctx.kindToChallenge = kinds?.at(0);
  ctx.userDashboard = dashboard;
  ctx.userFound = { ...payload, scrubbedEmail, scrubbedPhone };

  return ctx;
};

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

export {
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
};
