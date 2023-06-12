import {
  FootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { IdDI, IdvBootstrapData } from '@onefootprint/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const WAITING_USER_DATA_TIME = 500;

// There are two possible ways of getting the bootstrap data:
// (1) The bootstrap data is passed in the URL fragment
// (2) The bootstrap data is passed via post message
const useBootstrapData = (
  onSuccess: (bootstrapData: IdvBootstrapData) => void,
) => {
  const footprintProvider = useFootprintProvider();
  const router = useRouter();

  const parseBootstrapData = (data: IdvBootstrapData) => {
    // Support legacy bootstrap data formats until Fractional migrates over
    const legacyData = data as
      | { email?: string; phoneNumber?: string }
      | undefined;
    const legacyEmail = legacyData?.email;
    const legacyPhoneNumber = legacyData?.phoneNumber;
    if (legacyData?.email || legacyData?.phoneNumber) {
      onSuccess({
        [IdDI.email]: legacyEmail,
        [IdDI.phoneNumber]: legacyPhoneNumber,
      });
    } else {
      onSuccess(data);
    }
  };

  const parseUrlFragment = () => {
    const parts = router.asPath.split('#');
    if (parts.length !== 2) {
      return null;
    }

    const stringifiedBootstrapData = parts[1];
    let bootstrapData;
    try {
      bootstrapData = JSON.parse(decodeURIComponent(stringifiedBootstrapData));
    } catch (e) {
      return null;
    }

    if (
      !bootstrapData ||
      typeof bootstrapData !== 'object' ||
      bootstrapData === null
    ) {
      return null;
    }

    return bootstrapData as IdvBootstrapData;
  };

  const load = async () => {
    await footprintProvider.load();
  };

  // In order to avoid a race condition between the router & post message,
  // we always check router first, and then post message
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    load();

    const bootstrapData = parseUrlFragment();
    if (bootstrapData) {
      onSuccess(bootstrapData);
      return;
    }

    // If post message doesn't arrive for a while, assume there is no bootstrap data
    const expirationTimeout = setTimeout(() => {
      unsubscribe();
      onSuccess({});
    }, WAITING_USER_DATA_TIME);

    const unsubscribe = footprintProvider.on(
      FootprintInternalEvent.bootstrapDataReceived,
      (data: IdvBootstrapData) => {
        clearTimeout(expirationTimeout);
        parseBootstrapData(data);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);
};

export default useBootstrapData;
