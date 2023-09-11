import type { IdvBootstrapData } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';

// Support legacy bootstrap data formats until Fractional migrates over
const parseLegacyUserData = (data: IdvBootstrapData) => {
  const legacyData = data as
    | { email?: string; phoneNumber?: string }
    | undefined;
  const legacyEmail = legacyData?.email;
  const legacyPhoneNumber = legacyData?.phoneNumber;

  // Convert legacy data to new format
  if (legacyEmail || legacyPhoneNumber) {
    return {
      [IdDI.email]: legacyEmail,
      [IdDI.phoneNumber]: legacyPhoneNumber,
    };
  }
  return data;
};

export default parseLegacyUserData;
