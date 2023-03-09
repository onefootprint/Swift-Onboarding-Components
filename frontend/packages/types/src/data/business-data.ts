import { BeneficialOwner } from './beneficial-owner';
import BusinessDataAttribute from './business-data-attribute';
import { CountryCode } from './countries';

export type BusinessData = Partial<{
  [BusinessDataAttribute.name]: string;
  [BusinessDataAttribute.ein]: string;
  [BusinessDataAttribute.beneficialOwners]: BeneficialOwner[];
  [BusinessDataAttribute.addressLine1]: string;
  [BusinessDataAttribute.addressLine2]: string;
  [BusinessDataAttribute.city]: string;
  [BusinessDataAttribute.state]: string;
  [BusinessDataAttribute.country]: CountryCode;
  [BusinessDataAttribute.zip]: string;
}>;
