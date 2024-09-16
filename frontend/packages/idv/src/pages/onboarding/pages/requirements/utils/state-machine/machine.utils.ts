import { type OnboardingRequirement, OnboardingRequirementKind } from '@onefootprint/types';
import type { TransitionConfig, TransitionsConfig } from 'xstate';

import { ComponentsSdkTypes } from '@onefootprint/idv/src/utils/state-machine/types';
import type { MachineContext, MachineEvents } from './types';

export const getPreferUploadDoc = <K extends OnboardingRequirement>(docRequirement: K[]) =>
  docRequirement.find(
    requirement =>
      requirement.kind === OnboardingRequirementKind.document && requirement.uploadSettings === 'prefer_upload',
  );

const getFirstKind = (c: MachineContext): OnboardingRequirementKind | undefined => c.requirements[0]?.kind;

const isDeviceMobile = (c: MachineContext): boolean => c?.idvContext?.device?.type === 'mobile';
const isDeviceTablet = (c: MachineContext): boolean => c?.idvContext?.device?.type === 'tablet';
const isNoPhoneFlow = (c: MachineContext): boolean => Boolean(c?.onboardingContext?.config?.isNoPhoneFlow);
const isTransfer = (c: MachineContext): boolean => Boolean(c?.idvContext?.isTransfer);

const isAuthorize = (x: unknown) => x === OnboardingRequirementKind.authorize;
const isCollectKyb = (x: unknown) => x === OnboardingRequirementKind.collectKybData;
const isCollectKyc = (x: unknown) => x === OnboardingRequirementKind.collectKycData;
const isCollectDoc = (x: unknown) => x === OnboardingRequirementKind.document;
const isInvProfile = (x: unknown) => x === OnboardingRequirementKind.investorProfile;
const isRegisterPasskey = (x: unknown) => x === OnboardingRequirementKind.registerPasskey;
const isProcess = (x: unknown) => x === OnboardingRequirementKind.process;

const shouldRunCollectInvestorProfile = (ctx: MachineContext) => !isTransfer(ctx) && isInvProfile(getFirstKind(ctx));
const shouldRunCollectKybData = (ctx: MachineContext) => !isTransfer(ctx) && isCollectKyb(getFirstKind(ctx));
const shouldRunCollectKycData = (ctx: MachineContext) => !isTransfer(ctx) && isCollectKyc(getFirstKind(ctx));
const shouldRunLiveness = (ctx: MachineContext) => isRegisterPasskey(getFirstKind(ctx));
const shouldShowAuthorize = (ctx: MachineContext) => !isTransfer(ctx) && isAuthorize(getFirstKind(ctx));
const shouldShowProcess = (ctx: MachineContext) => !isTransfer(ctx) && isProcess(getFirstKind(ctx));

const shouldRunIdDoc = (ctx: MachineContext): boolean => {
  const isTabletOrMobile = isDeviceMobile(ctx) || isDeviceTablet(ctx);
  if (isTransfer(ctx) && !isTabletOrMobile) {
    // If we're running the transfer app on desktop, we want to keep the transfer as small as
    // possible. So, only register the passkey, don't allow also uploading id doc in desktop transfer
    return false;
  }
  return isCollectDoc(getFirstKind(ctx));
};

const shouldRunTransfer = (ctx: MachineContext): boolean => {
  // When running natively (not in an iframe) on mobile, we can register the passkey without transferring.
  // If we're on desktop, we should still attempt to transfer
  if (!ctx.idvContext.isInIframe && isDeviceMobile(ctx)) return false;

  if (isNoPhoneFlow(ctx)) return false;
  // If the user has clicked on "Continue on mobile" button, we should allow them to continue with the transfer
  if (!ctx.continueOnMobile && ctx.isTransferVisited) return false;
  if (isTransfer(ctx)) return false;

  // If we have a custom document with upload settings set as "prefer_upload",
  // we should first request the user to upload the document before transferring
  if (!ctx.continueOnMobile && getPreferUploadDoc(ctx.requirements)) return false;

  const nextRequirementIsLiveness = isRegisterPasskey(getFirstKind(ctx));
  const nextRequirementIsIdDoc = isCollectDoc(getFirstKind(ctx));
  return nextRequirementIsIdDoc || nextRequirementIsLiveness;
};

export const RequirementCompletedTransition: TransitionsConfig<MachineContext, MachineEvents> = {
  requirementCompleted: { target: 'checkRequirements' },
};

/**
 * ORDER MATTERS.
 * The ordering of these targets actually dictates the order in which requirements are handled by the frontend
 */
export const NextRequirementTargets: TransitionConfig<MachineContext, MachineEvents>[] = [
  { target: 'kybData', cond: context => shouldRunCollectKybData(context) },
  { target: 'kycData', cond: context => shouldRunCollectKycData(context) },
  { target: 'investorProfile', cond: context => shouldRunCollectInvestorProfile(context) },
  { target: 'transfer', cond: context => shouldRunTransfer(context) },
  { target: 'liveness', cond: context => shouldRunLiveness(context) },
  { target: 'idDoc', cond: context => shouldRunIdDoc(context) },
  { target: 'authorize', cond: context => shouldShowAuthorize(context) },
  { target: 'process', cond: context => shouldShowProcess(context) },
  { target: 'success' },
];

export const shouldWaitForComponentsSdk = (context: MachineContext) => {
  const componentSdkContext = context.idvContext.componentsSdkContext;
  if (!componentSdkContext) return false;

  const { componentsSdkType, skipRelayToComponents } = componentSdkContext;
  if (skipRelayToComponents) return false;
  if (componentsSdkType === ComponentsSdkTypes.WEB) {
    return !!context.idvContext.isInIframe;
  }
  return componentsSdkType === ComponentsSdkTypes.MOBILE;
};
