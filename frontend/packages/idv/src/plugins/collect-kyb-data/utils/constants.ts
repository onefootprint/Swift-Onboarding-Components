import { BeneficialOwnerDataAttribute, BusinessDI } from '@onefootprint/types';

export type IdField = 'id.first_name' | 'id.last_name' | 'id.email' | 'id.phone_number';

export const BeneficialOwnerIdFields: IdField[] = ['id.first_name', 'id.last_name', 'id.email', 'id.phone_number'];

export const BusinessAddressFields = [
  'business.address_line1',
  'business.address_line2',
  'business.city',
  'business.state',
  'business.zip',
  'business.country',
];

export const BENEFICIAL_OWNER_ATTRIBUTE: Record<IdField, BeneficialOwnerDataAttribute> = {
  'id.first_name': BeneficialOwnerDataAttribute.firstName,
  'id.last_name': BeneficialOwnerDataAttribute.lastName,
  'id.phone_number': BeneficialOwnerDataAttribute.phoneNumber,
  'id.email': BeneficialOwnerDataAttribute.email,
};

export const BusinessFields: Exclude<`${BusinessDI}`, 'business.tin'>[] = [
  'business.address_line1',
  'business.address_line2',
  'business.beneficial_owners',
  'business.city',
  'business.corporation_type',
  'business.country',
  'business.dba',
  'business.formation_date',
  'business.formation_state',
  'business.kyced_beneficial_owners',
  'business.name',
  'business.phone_number',
  'business.state',
  'business.website',
  'business.zip',
];
