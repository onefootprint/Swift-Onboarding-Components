import {
  FootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { IdDI, IdvBootstrapData } from '@onefootprint/types';
import { useEffectOnce } from 'usehooks-ts';

const WAITING_USER_DATA_TIME = 500;

const useBootstrapData = (
  onSuccess: (bootstrapData: IdvBootstrapData) => void,
) => {
  const footprintProvider = useFootprintProvider();

  const waitBootstrapDataOrStart = () => {
    const expirationTimeout = setTimeout(() => {
      unsubscribe();
      onSuccess({});
    }, WAITING_USER_DATA_TIME);

    const unsubscribe = footprintProvider.on(
      FootprintInternalEvent.bootstrapDataReceived,
      (data: IdvBootstrapData) => {
        clearTimeout(expirationTimeout);

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
      },
    );
  };

  const load = async () => {
    await footprintProvider.load();
    waitBootstrapDataOrStart();
  };

  useEffectOnce(() => {
    load();
  });
};

export default useBootstrapData;
