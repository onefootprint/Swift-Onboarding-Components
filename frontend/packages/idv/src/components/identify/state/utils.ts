import { isEmail, isPhoneNumber } from '@onefootprint/core';
import { ChallengeKind as Kind } from '@onefootprint/types';
import { AuthMethodKind } from '@onefootprint/types';

import type { DeviceInfo as Device } from '../../../hooks';
import { getRandomID } from '../../../utils';
import validateBootstrapData from '../utils/validate-bootstrap-data';
import type { IdentifyMachineContext as Context, IdentifyContext, NavigatedToPrevPage } from './types';
import { IdentifyMachineArgs, IdentifyVariant } from './types';

type User = IdentifyContext['user'];

export const isAuthFlow = (v: unknown): v is IdentifyVariant.auth => v === IdentifyVariant.auth;

const isUpdateLoginFlow = (v: unknown): v is IdentifyVariant.updateLoginMethods =>
  v === IdentifyVariant.updateLoginMethods;

const getRequiredAuthMethods = (ctx: Context): `${AuthMethodKind}`[] => ctx.config?.requiredAuthMethods || [];

export const isEmailVerificationRequired = (ctx: Context): boolean =>
  getRequiredAuthMethods(ctx).includes(AuthMethodKind.email);

export const isPhoneVerificationRequired = (ctx: Context): boolean =>
  getRequiredAuthMethods(ctx).includes(AuthMethodKind.phone);

export const hasSingleRequiredAuthMethod = (kind: `${AuthMethodKind}`, ctx: Context): boolean =>
  getRequiredAuthMethods(ctx).length === 1 && getRequiredAuthMethods(ctx)[0] === kind;

/** @deprecated we should rely requiredAuthMethods */
export const isNoPhoneFlow = (ctx: Context): boolean => Boolean(ctx.config?.isNoPhoneFlow);

export const isEmailOrPhonePresent = (ctx: Context): boolean =>
  isEmail(ctx?.email?.value || '') || isPhoneNumber(ctx?.phoneNumber?.value || '');

export const isEmailAndPhonePresent = (ctx: Context): boolean =>
  isEmail(ctx?.email?.value || '') && isPhoneNumber(ctx?.phoneNumber?.value || '');

export const getAvailableChallengeKinds = (device: Device, user: User) => {
  if (!user) return [];

  // Check if device supports biometric challenge
  if (!device.hasSupportForWebauthn) {
    return user.availableChallengeKinds.filter(kind => kind !== Kind.biometric);
  }

  return user.availableChallengeKinds;
};

export const isUserFoundWithSingleChallenge = (kind: Kind, device: Device, user?: User): boolean => {
  const challengeKinds = getAvailableChallengeKinds(device, user);
  return challengeKinds?.length === 1 && challengeKinds[0] === kind;
};

export const shouldShowChallengeSelector = (ctx: Context, user?: User): boolean =>
  isUpdateLoginFlow(ctx.variant) || getAvailableChallengeKinds(ctx.device, user).length > 1;

export const isRequiredAuthMethodsPending = (kind: `${AuthMethodKind}`, ctx: Context): boolean => {
  const isRequiredByPlaybook = getRequiredAuthMethods(ctx).includes(kind);
  const userHadVerifiedKind = ctx.identify?.user?.authMethods
    ?.filter(m => m.isVerified)
    .map<`${AuthMethodKind}`>(m => m.kind)
    .includes(kind);

  return isRequiredByPlaybook && !userHadVerifiedKind;
};

export const getMachineArgs = ({
  bootstrapData,
  config,
  device,
  initialAuthToken,
  isComponentsSdk,
  isLive,
  logoConfig,
  obConfigAuth,
  overallOutcome,
  sandboxId,
  variant,
}: IdentifyMachineArgs): Context => {
  const { email, phoneNumber } = validateBootstrapData(bootstrapData);
  return {
    bootstrapData: bootstrapData ?? {},
    challenge: {},
    config,
    device,
    email,
    identify: {},
    initialAuthToken,
    isComponentsSdk: !!isComponentsSdk,
    isLive,
    logoConfig,
    obConfigAuth,
    overallOutcome,
    phoneNumber,
    sandboxId: config?.isLive === false && !initialAuthToken ? sandboxId || getRandomID(13) : undefined,
    variant,
  };
};
