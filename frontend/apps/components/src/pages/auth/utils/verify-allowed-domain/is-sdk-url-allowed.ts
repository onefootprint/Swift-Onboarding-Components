import type { CustomChildAPI } from '../../../../components/footprint-provider/types';
import isDomainAllowed from './verify-allowed-domain';

type Client = { getAdapterResponse: () => CustomChildAPI | null };

const isSdkUrlAllowed = (client: Client, domainList: string[] | undefined) => {
  const sdkUrl = client.getAdapterResponse()?.model?.sdkUrl;
  /**
   * There are two possible reasons for the absence of sdkURL
   * 1 - Customers who do not have the latest version of the SDK
   * 2 - Customers not using iframe integration
   */
  return !sdkUrl ? true : isDomainAllowed(sdkUrl, domainList);
};

export default isSdkUrlAllowed;
