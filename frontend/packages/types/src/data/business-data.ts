import { BeneficialOwner } from './beneficial-owner';
import BusinessDataAttribute from './business-data-attribute';
import { CountryCode } from './countries';
import { BusinessDI } from './di';

export type BusinessData = Partial<{
  [BusinessDataAttribute.name]: string;
  [BusinessDataAttribute.doingBusinessAs]: string;
  [BusinessDataAttribute.tin]: string;
  [BusinessDataAttribute.website]: string;
  [BusinessDataAttribute.phoneNumber]: string;
  [BusinessDataAttribute.corporationType]: string;
  [BusinessDataAttribute.beneficialOwners]: BeneficialOwner[];
  // TODO
  [BusinessDataAttribute.kycedBeneficialOwners]: BeneficialOwner[];
  [BusinessDataAttribute.addressLine1]: string;
  [BusinessDataAttribute.addressLine2]: string;
  [BusinessDataAttribute.city]: string;
  [BusinessDataAttribute.state]: string;
  [BusinessDataAttribute.country]: CountryCode;
  [BusinessDataAttribute.zip]: string;
}>;

export type BusinessDIData = Partial<{
  [BusinessDI.name]: string;
  [BusinessDI.doingBusinessAs]: string;
  [BusinessDI.tin]: string;
  [BusinessDI.website]: string;
  [BusinessDI.phoneNumber]: string;
  [BusinessDI.corporationType]: string;
  [BusinessDI.beneficialOwners]: BeneficialOwner[];
  [BusinessDI.kycedBeneficialOwners]: BeneficialOwner[];
  [BusinessDI.addressLine1]: string;
  [BusinessDI.addressLine2]: string;
  [BusinessDI.city]: string;
  [BusinessDI.state]: string;
  [BusinessDI.country]: CountryCode;
  [BusinessDI.zip]: string;
}>;
