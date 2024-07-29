import type { OnboardingRequirement, OnboardingStatusResponse } from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';

type MachineContext = {
  isComponentsSdk: boolean;
  isInvestorProfileCollected: boolean;
  isKybDataCollected: boolean;
  isKycDataCollected: boolean;
  isRequirementRouterVisited: boolean;
  isTransfer: boolean;
};

const isCollectKyb = (x: unknown) => x === OnboardingRequirementKind.collectKybData;

const isCollectKyc = (x: unknown) => x === OnboardingRequirementKind.collectKycData;

const isInvProfile = (x: unknown) => x === OnboardingRequirementKind.investorProfile;

/** Show the CollectKybData plugin one time, even if it's met, to make sure we show the confirm page. */
export const shouldShowCollectKybDataPlugin = (ctx: MachineContext, req: OnboardingRequirement): boolean =>
  isCollectKyb(req.kind) && !ctx.isKybDataCollected && !ctx.isComponentsSdk && !ctx.isTransfer;

/** Show the CollectKycData plugin one time, even if it's met, to make sure we show the confirm page. */
export const shouldShowCollectKycDataPlugin = (ctx: MachineContext, req: OnboardingRequirement): boolean =>
  isCollectKyc(req.kind) && !ctx.isKycDataCollected && !ctx.isComponentsSdk && !ctx.isTransfer;

/** Show the investor profile plugin one time, even if it's met, to make sure we show the confirm page. */
export const shouldShowInvestorProfilePlugin = (ctx: MachineContext, req: OnboardingRequirement): boolean =>
  isInvProfile(req.kind) &&
  ctx.isKycDataCollected && // Only show if we've collected KYC
  !ctx.isInvestorProfileCollected &&
  !ctx.isComponentsSdk &&
  !ctx.isTransfer;

/**
 * Given the list of requirements from the backend and some information about which requirements
 * we've already displayed, computes the frontend
 *
 * @param {MachineContext} ctx
 * @param {OnboardingStatusResponse} res
 * @returns {OnboardingRequirement[]}
 */
export const filterRequirementsToShow = (
  ctx: MachineContext,
  res: OnboardingStatusResponse,
): OnboardingRequirement[] => {
  const { allRequirements } = res;
  const unmetRequirements: OnboardingRequirement[] = allRequirements
    .filter(r => r.kind !== OnboardingRequirementKind.registerAuthMethod)
    .filter(r => !r.isMet);

  if (!ctx.isRequirementRouterVisited && !unmetRequirements.length) {
    // If we haven't started data collection (== this is the first time we've checked requirements),
    // and if there are no unmet requirements, short circuit through all requirements.
    // This handles the case where someone tries to onboard onto the exact same onboarding config.
    return [];
  }

  // We want to show all unmet requirements, plus a few met requirements only once.
  // Note that we must PRESERVE THE ORDER of the requirements as given to us by the backend
  const requirements: OnboardingRequirement[] = allRequirements.filter((r: OnboardingRequirement) => {
    /** Take all unmet requirements */
    if (!r.isMet) return true;

    /** Special Condition to render confirm page for collect KYB */
    if (shouldShowCollectKybDataPlugin(ctx, r)) return true;

    /** Special Condition to render confirm page for collect KYC */
    if (shouldShowCollectKycDataPlugin(ctx, r)) return true;

    /** Special Condition to render the investor profile when we've collected KYC data and we're not in the components SDK and we're not in the transfer */
    if (shouldShowInvestorProfilePlugin(ctx, r)) return true;

    return false;
  });

  return requirements;
};

export default filterRequirementsToShow;
