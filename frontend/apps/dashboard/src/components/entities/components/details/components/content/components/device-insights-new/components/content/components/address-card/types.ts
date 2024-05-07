import { BusinessDI, IdDI } from '@onefootprint/types';

export enum AddressType {
  business = 'business',
  residential = 'residential',
}

export const attributesByType = {
  [AddressType.business]: [
    BusinessDI.addressLine1,
    BusinessDI.addressLine2,
    BusinessDI.city,
    BusinessDI.state,
    BusinessDI.zip,
    BusinessDI.country,
  ],
  [AddressType.residential]: [
    IdDI.addressLine1,
    IdDI.addressLine2,
    IdDI.city,
    IdDI.state,
    IdDI.zip,
    IdDI.country,
  ],
};
