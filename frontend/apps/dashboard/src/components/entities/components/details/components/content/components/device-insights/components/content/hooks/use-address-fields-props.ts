import type { Entity } from '@onefootprint/types';
import { BusinessDI, IdDI } from '@onefootprint/types';

import useField from '../../../../vault/hooks/use-field';
import AddressType from '../components/address-card/types';

const attributesByType = {
  [AddressType.business]: [
    BusinessDI.addressLine1,
    BusinessDI.addressLine2,
    BusinessDI.city,
    BusinessDI.state,
    BusinessDI.zip,
    BusinessDI.country,
  ],
  [AddressType.residential]: [IdDI.addressLine1, IdDI.addressLine2, IdDI.city, IdDI.state, IdDI.zip, IdDI.country],
};

const useAddressFieldsProps = (entity: Entity) => {
  const getProps = useField(entity);

  const getAddressDis = (type: AddressType) => {
    const dis = attributesByType[type].filter(di => entity.decryptableAttributes.includes(di));
    const disSet = new Set(dis);
    const filteredAttributes = entity.data
      .filter(attr => disSet.has(attr.identifier as IdDI | BusinessDI))
      .map(attr => attr.identifier) as (IdDI | BusinessDI)[];
    const sortedAttributes = filteredAttributes.sort((a, b) => dis.indexOf(a) - dis.indexOf(b));
    // If address line 1 is present, insert address line 2 right afterwards as well
    if (sortedAttributes.includes(IdDI.addressLine1) && !sortedAttributes.includes(IdDI.addressLine2)) {
      const index = sortedAttributes.indexOf(IdDI.addressLine1);
      sortedAttributes.splice(index + 1, 0, IdDI.addressLine2);
    }
    return sortedAttributes;
  };

  const getAddressFieldsProps = (type: AddressType) => {
    const dis = getAddressDis(type);
    return dis.map(getProps);
  };

  return {
    getAddressDis,
    getAddressFieldsProps,
  };
};

export default useAddressFieldsProps;
