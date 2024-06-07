import { IdDI } from '@onefootprint/types';
import type { Attribute } from '@onefootprint/types/src/data/entity';

const getTruncatedName = (attributes: Attribute[]) => {
  // find an attribute in attributes that has identifier with value IdDI.fistName
  const firstNameAttribute = attributes.find(attribute => attribute.identifier === IdDI.firstName);

  // find an attribute in attributes that has identifier with value IdDI.lastName
  const lastNameAttribute = attributes.find(attribute => attribute.identifier === IdDI.lastName);

  if (!firstNameAttribute) {
    return '-';
  }

  const firstName = firstNameAttribute.value;
  if (!firstName) {
    return '-';
  }

  const lastNameInitial = lastNameAttribute?.transforms.prefix_1 ? `${lastNameAttribute.transforms.prefix_1}.` : '';

  const name = `${firstName} ${lastNameInitial}`.trim();
  return name;
};

export default getTruncatedName;
