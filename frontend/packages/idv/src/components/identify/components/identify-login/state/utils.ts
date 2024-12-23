import { isEmail, isPhoneNumber } from '@onefootprint/core';
import { AuthMethodKind, type ChallengeKind } from '@onefootprint/types';

import { getAvailableMethods } from '../components/challenge-select-or-passkey/utils';
import type { LoginInitialArgs } from '../identify-login';
import type { IdentifyMachineContext as Context } from './types';
import { IdentifyVariant } from './types';

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

export const isEmailOrPhoneValid = (ctx: Context): boolean =>
  isEmail(ctx?.email?.value || '') || isPhoneNumber(ctx?.phoneNumber?.value || '');

export const isEmailAndPhoneValid = (ctx: Context): boolean =>
  isEmail(ctx?.email?.value || '') && isPhoneNumber(ctx?.phoneNumber?.value || '');

export const isUserFoundWithSingleChallenge = (kind: ChallengeKind, ctx: Context): boolean => {
  const challengeKinds = getAvailableMethods(ctx.identify.user, ctx.device);
  return challengeKinds?.length === 1 && challengeKinds[0] === kind;
};

export const shouldShowChallengeSelector = (ctx: Context): boolean =>
  isUpdateLoginFlow(ctx.variant) || getAvailableMethods(ctx.identify.user, ctx.device).length > 1;

export const isRequiredAuthMethodsPending = (kind: `${AuthMethodKind}`, ctx: Context): boolean => {
  const isRequiredByPlaybook = getRequiredAuthMethods(ctx).includes(kind);
  const userHadVerifiedKind = ctx.identify?.user?.authMethods
    ?.filter(m => m.isVerified)
    .map<`${AuthMethodKind}`>(m => m.kind)
    .includes(kind);

  return isRequiredByPlaybook && !userHadVerifiedKind;
};

export const getMachineArgs = ({
  config,
  device,
  identify,
  isComponentsSdk,
  isLive,
  logoConfig,
  obConfigAuth,
  overallOutcome,
  variant,
  email,
  phoneNumber,
}: LoginInitialArgs): Context => {
  const bootstrapData = {
    email: email?.isBootstrap ? email?.value : undefined,
    phoneNumber: phoneNumber?.isBootstrap ? phoneNumber?.value : undefined,
  };
  return {
    bootstrapData,
    challenge: {},
    config,
    device,
    email,
    identify,
    isComponentsSdk: !!isComponentsSdk,
    isLive,
    logoConfig,
    obConfigAuth,
    overallOutcome,
    phoneNumber,
    variant,
  };
};
