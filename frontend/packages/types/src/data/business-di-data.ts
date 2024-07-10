import type { BeneficialOwner } from './beneficial-owner';
import type { CountryCode } from './countries';
import type { BusinessDI } from './di';

export type BusinessDIData = Partial<{ [K in BusinessDI]: ValueTypeForBusinessDI<K> }>;

export type ValueTypeForBusinessDI<K> = K extends BusinessDI.addressLine1
  ? string
  : K extends BusinessDI.addressLine2
    ? string
    : K extends BusinessDI.beneficialOwners
      ? BeneficialOwner[]
      : K extends BusinessDI.city
        ? string
        : K extends BusinessDI.corporationType
          ? string
          : K extends BusinessDI.country
            ? CountryCode
            : K extends BusinessDI.doingBusinessAs
              ? string
              : K extends BusinessDI.kycedBeneficialOwners
                ? BeneficialOwner[]
                : K extends BusinessDI.name
                  ? string
                  : K extends BusinessDI.phoneNumber
                    ? string
                    : K extends BusinessDI.state
                      ? string
                      : K extends BusinessDI.tin
                        ? string
                        : K extends BusinessDI.website
                          ? string
                          : K extends BusinessDI.zip
                            ? string
                            : never;
