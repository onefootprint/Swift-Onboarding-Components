import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import useGetOnboardingSession, { type GetOnboardingSessionResponse } from '../use-get-onboarding-session';

const OB_TOKEN_PREFIXES = ['pbtok_'];

const isObSessionToken = (tok?: string) => OB_TOKEN_PREFIXES.some(prefix => tok?.startsWith(prefix));

const useMergeOnboardingSession = () => {
  const getOnboardingSession = useGetOnboardingSession();

  /** Given the sdk arguments, merges with onboarding session arguments from the backend (if any). Returns the merged data. Throws an exception if we cannot fetch the onboarding session or cannot merge the data. */
  const mergeOnboardingSession = async (sdkArgsData: FootprintVerifyDataProps) => {
    // For backwards compatibility with yieldstreet, we accept a `pbtok_` in the authToken SDK argument. We should
    // ask them to migrate off of this and use `publicKey` (to be renamed to `playbookKey`)
    const maybePbToks = [sdkArgsData.authToken, sdkArgsData.publicKey];
    const pbTok = maybePbToks.find(tok => isObSessionToken(tok));
    if (!pbTok) {
      // No onboarding session token, can just return the SDK arguments as-is.
      return sdkArgsData;
    }

    // The `publicKey` provided to the SDK is an onboarding session token, a token created on the tenant's
    // backend that contains a subset of SDK arguments.
    // Fetch the onboarding session data and merge it with the sdkArgsData.
    const onboardingSessionData = await getOnboardingSession.mutateAsync(pbTok);
    const mergedData = mergeData(pbTok, sdkArgsData, onboardingSessionData);
    return mergedData;
  };
  return mergeOnboardingSession;
};

/** Given the data passed to the SDK and the data from the onboarding session token, merges them to create the final SDK arguments. Throws an error if a property is specified in both `sdkArgsData` and `onboardingSessionData` */
export const mergeData = (
  pbTok: string,
  sdkArgsData: FootprintVerifyDataProps,
  onboardingSessionData: GetOnboardingSessionResponse,
) => {
  const sdkBootstrapData = sdkArgsData.bootstrapData || sdkArgsData.userData || {};
  if (Object.keys(sdkBootstrapData).length && Object.keys(onboardingSessionData.bootstrapData || {}).length) {
    throw Error(
      'Cannot provide `bootstrapData` argument to the SDK when the onboarding session token already specifies bootstrap data.',
    );
  }

  const mergedData: FootprintVerifyDataProps = {
    ...sdkArgsData,
    // If authToken provided was a `pbtok_`, it shouldn't be passed on to the rest of bifrost and should
    // instead just be passed as the `publicKey`.
    // This is only for backwards compatibility with Yieldstreet's integration where they are passing the
    // onboarding session token as an `authToken`.
    authToken: isObSessionToken(sdkArgsData.authToken) ? undefined : sdkArgsData.authToken,
    bootstrapData: Object.keys(onboardingSessionData.bootstrapData || {}).length
      ? onboardingSessionData.bootstrapData
      : sdkArgsData.bootstrapData,
    publicKey: pbTok,
  };

  return mergedData;
};

export default useMergeOnboardingSession;
