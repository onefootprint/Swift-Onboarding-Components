import type { InsightAddress } from '@onefootprint/request-types/dashboard';
import type { FormattedAddress } from '../../../../onboarding-business-insight.types';

const formatAddresses = (addresses: InsightAddress[]): FormattedAddress[] => {
  return addresses.map((address, index) => ({
    id: `${index}`,
    ...address,
  }));
};

export default formatAddresses;
