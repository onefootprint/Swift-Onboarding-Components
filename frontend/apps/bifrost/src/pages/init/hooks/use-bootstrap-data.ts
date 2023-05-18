import {
  FootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { IdvBootstrapData } from '@onefootprint/types';
import { useEffectOnce } from 'usehooks-ts';

const WAITING_USER_DATA_TIME = 500;

const useBootstrapData = (
  onSuccess: (bootstrapData?: IdvBootstrapData) => void,
) => {
  const footprintProvider = useFootprintProvider();

  const waitBootstrapDataOrStart = () => {
    const expirationTimeout = setTimeout(() => {
      unsubscribe();
      onSuccess();
    }, WAITING_USER_DATA_TIME);

    const unsubscribe = footprintProvider.on(
      FootprintInternalEvent.bootstrapDataReceived,
      (data: IdvBootstrapData) => {
        clearTimeout(expirationTimeout);
        onSuccess(data);
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
