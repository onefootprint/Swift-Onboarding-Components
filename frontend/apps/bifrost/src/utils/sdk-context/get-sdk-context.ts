import type { ProviderReturn } from '@onefootprint/idv';

const extractCleanDomain = (s: string): string => s.replace(/(https?:\/\/)?(www\.)?/gi, '').split(/[/?#]/)[0];

const getSdkContext = async (
  fpProvider: ProviderReturn,
): Promise<{ sdkUrl: string; sdkVersion: string } | Record<string, never>> => {
  try {
    const childApiRef = await fpProvider.load();
    const sdkUrl = childApiRef?.model?.sdkUrl || '';
    return {
      sdkUrl: extractCleanDomain(sdkUrl),
      sdkVersion: childApiRef?.model?.sdkVersion || '',
    };
  } catch {
    return {};
  }
};

export default getSdkContext;
