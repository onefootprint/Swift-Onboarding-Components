import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import useGetOnboardingSession, { type GetOnboardingSessionResponse } from '../use-get-onboarding-session';

const OB_TOKEN_PREFIXES = ['obtok_', 'pbtok_'];

const useMergeOnboardingSession = () => {
  const getOnboardingSession = useGetOnboardingSession();

  /** Given the sdk arguments, merges with onboarding session arguments from the backend (if any). Returns the merged data. Throws an exception if we cannot fetch the onboarding session or cannot merge the data. */
  const mergeOnboardingSession = async (sdkArgsData: FootprintVerifyDataProps) => {
    if (!sdkArgsData.authToken || !OB_TOKEN_PREFIXES.some(prefix => sdkArgsData.authToken?.startsWith(prefix))) {
      return sdkArgsData;
    }

    // The `authToken` provided to the SDK is an onboarding session token, a token created on the tenant's
    // backend that contains a subset of SDK arguments.
    // Fetch the onboarding session data and merge it with the sdkArgsData.
    const onboardingSessionData = await getOnboardingSession.mutateAsync(sdkArgsData.authToken);
    const mergedData = mergeData(sdkArgsData, onboardingSessionData);
    return mergedData;
  };
  return mergeOnboardingSession;
};

/** Given the data passed to the SDK and the data from the onboarding session token, merges them to create the final SDK arguments. Throws an error if a property is specified in both `sdkArgsData` and `onboardingSessionData` */
export const mergeData = (
  sdkArgsData: FootprintVerifyDataProps,
  onboardingSessionData: GetOnboardingSessionResponse,
) => {
  if (sdkArgsData.publicKey && onboardingSessionData.key) {
    throw Error(
      'Cannot provide a `publicKey` argument to the SDK when the onboarding session token already specified a playbook `key`.',
    );
  }

  const sdkBootstrapData = sdkArgsData.bootstrapData || sdkArgsData.userData || {};
  if (Object.keys(sdkBootstrapData).length && Object.keys(onboardingSessionData.bootstrapData || {}).length) {
    throw Error(
      'Cannot provide `bootstrapData` argument to the SDK when the onboarding session token already specifies bootstrap data.',
    );
  }

  const mergedData: FootprintVerifyDataProps = {
    ...sdkArgsData,
    // The authToken provided was a `pbtok_` and shouldn't be passed on to the rest of bifrost
    authToken: undefined,
    bootstrapData: Object.keys(onboardingSessionData.bootstrapData || {}).length
      ? onboardingSessionData.bootstrapData
      : sdkArgsData.bootstrapData,
    publicKey: onboardingSessionData.key || sdkArgsData.publicKey,
  };

  return mergedData;
};

export default useMergeOnboardingSession;
