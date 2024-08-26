import type { BeneficialOwner, BeneficialOwnerDataAttribute } from './beneficial-owner';
import type { BusinessDIData } from './business-di-data';
import type { BusinessDI } from './di';
import type { IdDIData } from './id-di-data';

export const BootstrapOnlyBusinessOwnersKey = 'business.owners';

type BusinessBootstrapOnlyProps = {
  [BootstrapOnlyBusinessOwnersKey]?: Partial<Omit<BeneficialOwner, BeneficialOwnerDataAttribute.middleName>>[];
};

export type BootstrapIgnoredBusinessDI =
  | BusinessDI.beneficialOwners
  | BusinessDI.kycedBeneficialOwners
  | BusinessDI.formationState
  | BusinessDI.formationDate;

// TODO: expand in the future with KybBootstrapData and InvestorProfileBootstrapData
export type IdvBootstrapData = IdDIData & Omit<BusinessDIData, BootstrapIgnoredBusinessDI> & BusinessBootstrapOnlyProps;

export type IdvOptions = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};

export type KycBootstrapData = IdDIData;
