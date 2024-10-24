import type { BeneficialOwner, BeneficialOwnerDataAttribute } from './beneficial-owner';
import type { BusinessDIData } from './business-di-data';
import type { BusinessDI } from './di';
import type { IdDIData } from './id-di-data';

export const BootstrapOnlyBusinessSecondaryOwnersKey = 'business.secondary_owners';
export const BootstrapOnlyBusinessPrimaryOwnerStake = 'business.primary_owner_stake';

type BusinessBootstrapOnlyProps = {
  [BootstrapOnlyBusinessSecondaryOwnersKey]?: Partial<Omit<BeneficialOwner, BeneficialOwnerDataAttribute.middleName>>[];
  [BootstrapOnlyBusinessPrimaryOwnerStake]?: number;
};

export type BootstrapIgnoredBusinessDI =
  | BusinessDI.beneficialOwners
  | BusinessDI.kycedBeneficialOwners
  | BusinessDI.formationState
  | BusinessDI.formationDate
  | BusinessDI.beneficialOwnerExplanationMessage;

// TODO: expand in the future with InvestorProfileBootstrapData
export type IdvBootstrapData = IdDIData & Omit<BusinessDIData, BootstrapIgnoredBusinessDI> & BusinessBootstrapOnlyProps;

export type IdvOptions = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};

export type KycBootstrapData = IdDIData;
