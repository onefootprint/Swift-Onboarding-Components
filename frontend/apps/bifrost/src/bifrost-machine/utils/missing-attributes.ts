import { UserData } from 'src/bifrost-machine/types';

import { UserDataAttribute } from '../types/types';

export const isMissingBasicAttribute = (attributes: Set<UserDataAttribute>) =>
  attributes.has(UserDataAttribute.firstName) ||
  attributes.has(UserDataAttribute.lastName) ||
  attributes.has(UserDataAttribute.dob);

export const isMissingResidentialAttribute = (
  attributes: Set<UserDataAttribute>,
) =>
  attributes.has(UserDataAttribute.streetAddress) ||
  attributes.has(UserDataAttribute.streetAddress2) ||
  attributes.has(UserDataAttribute.city) ||
  attributes.has(UserDataAttribute.state) ||
  attributes.has(UserDataAttribute.country) ||
  attributes.has(UserDataAttribute.zipCode);

export const isMissingSsnAttribute = (attributes: Set<UserDataAttribute>) =>
  attributes.has(UserDataAttribute.ssn);

export const hasMissingAttributes = (attributes: Set<UserDataAttribute>) =>
  attributes.size > 0;

export const cleanMissingAttributes = (
  attributes: Set<UserDataAttribute>,
  filledData: UserData,
) => {
  Object.entries(filledData).forEach((entry: [string, string]) => {
    if (entry[1]) {
      attributes.delete(entry[0] as UserDataAttribute);
    }
  });
};
