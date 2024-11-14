import type { BusinessDI } from '@onefootprint/types';

export const BusinessAddressFields = [
  'business.address_line1',
  'business.address_line2',
  'business.city',
  'business.state',
  'business.zip',
  'business.country',
];

export const BusinessFields: Exclude<`${BusinessDI}`, 'business.tin'>[] = [
  'business.address_line1',
  'business.address_line2',
  'business.city',
  'business.corporation_type',
  'business.country',
  'business.dba',
  'business.formation_date',
  'business.formation_state',
  'business.name',
  'business.phone_number',
  'business.state',
  'business.website',
  'business.zip',
];
