import { UserDataAttribute } from '@onefootprint/types';
import { UserVaultData } from 'src/pages/users/users.types';

const getSectionsVisibility = (vaultData?: UserVaultData) => {
  const { kycData, idDoc } = vaultData ?? {};
  const hasFirstName = kycData?.[UserDataAttribute.firstName] !== undefined;
  const hasLastName = kycData?.[UserDataAttribute.lastName] !== undefined;
  const hasPhoneNumber = kycData?.[UserDataAttribute.phoneNumber] !== undefined;
  const hasEmail = kycData?.[UserDataAttribute.email] !== undefined;
  const hasSsn4 = kycData?.[UserDataAttribute.ssn4] !== undefined;
  const hasSsn9 = kycData?.[UserDataAttribute.ssn9] !== undefined;
  const hasDob = kycData?.[UserDataAttribute.dob] !== undefined;
  const hasAddressLine1 =
    kycData?.[UserDataAttribute.addressLine1] !== undefined;
  const hasAddressLine2 =
    kycData?.[UserDataAttribute.addressLine2] !== undefined;
  const hasCity = kycData?.[UserDataAttribute.city] !== undefined;
  const hasState = kycData?.[UserDataAttribute.state] !== undefined;
  const hasCountry = kycData?.[UserDataAttribute.country] !== undefined;
  const hasZip = kycData?.[UserDataAttribute.zip] !== undefined;
  const hasIdDocImages = !!idDoc && Object.keys(idDoc).length > 0;

  return {
    basicSection: hasFirstName || hasLastName || hasPhoneNumber || hasEmail,
    identitySection: hasSsn4 || hasSsn9 || hasDob,
    addressSection:
      hasAddressLine1 ||
      hasAddressLine2 ||
      hasCity ||
      hasState ||
      hasCountry ||
      hasZip,
    idDocSection: hasIdDocImages,
  };
};

export default getSectionsVisibility;
