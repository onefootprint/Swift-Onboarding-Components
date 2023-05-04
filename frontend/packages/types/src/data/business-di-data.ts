import { BeneficialOwner } from './beneficial-owner';
import { CountryCode } from './countries';
import { BusinessDI } from './di';

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
