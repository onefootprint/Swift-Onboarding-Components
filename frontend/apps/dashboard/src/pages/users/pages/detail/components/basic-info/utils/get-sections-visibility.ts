import { UserDataAttribute } from 'types';

const getSectionsVisibility = (userDataAttributes: UserDataAttribute[]) => ({
  basic: true,
  identity:
    userDataAttributes.includes(UserDataAttribute.ssn4) ||
    userDataAttributes.includes(UserDataAttribute.ssn9) ||
    userDataAttributes.includes(UserDataAttribute.dob),
  address:
    userDataAttributes.includes(UserDataAttribute.addressLine1) ||
    userDataAttributes.includes(UserDataAttribute.addressLine2) ||
    userDataAttributes.includes(UserDataAttribute.city) ||
    userDataAttributes.includes(UserDataAttribute.state) ||
    userDataAttributes.includes(UserDataAttribute.country) ||
    userDataAttributes.includes(UserDataAttribute.zip),
});

export default getSectionsVisibility;
