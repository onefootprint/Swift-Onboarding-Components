import { UserDataAttribute } from '@onefootprint/types';

const getSectionsVisibility = (
  identityDataAttributes: UserDataAttribute[],
) => ({
  basic: true,
  identity:
    identityDataAttributes.includes(UserDataAttribute.ssn4) ||
    identityDataAttributes.includes(UserDataAttribute.ssn9) ||
    identityDataAttributes.includes(UserDataAttribute.dob),
  address:
    identityDataAttributes.includes(UserDataAttribute.addressLine1) ||
    identityDataAttributes.includes(UserDataAttribute.addressLine2) ||
    identityDataAttributes.includes(UserDataAttribute.city) ||
    identityDataAttributes.includes(UserDataAttribute.state) ||
    identityDataAttributes.includes(UserDataAttribute.country) ||
    identityDataAttributes.includes(UserDataAttribute.zip),
});

export default getSectionsVisibility;
