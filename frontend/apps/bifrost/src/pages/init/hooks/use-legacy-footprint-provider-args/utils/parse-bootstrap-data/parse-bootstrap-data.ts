import { IdDI, IdvBootstrapData } from '@onefootprint/types';

// Support legacy bootstrap data formats until Fractional migrates over
const parseBootstrapData = (data: IdvBootstrapData) => {
  const legacyData = data as
    | { email?: string; phoneNumber?: string }
    | undefined;
  const legacyEmail = legacyData?.email;
  const legacyPhoneNumber = legacyData?.phoneNumber;

  // Convert legacy data to new format
  if (legacyData?.email || legacyData?.phoneNumber) {
    return {
      [IdDI.email]: legacyEmail,
      [IdDI.phoneNumber]: legacyPhoneNumber,
    };
  }
  return data;
};

export default parseBootstrapData;
