import {
  FootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/footprint-elements';
import { BootstrapData } from 'src/hooks/use-bifrost-machine';
import { useEffectOnce } from 'usehooks-ts';

const WAITING_USER_DATA_TIME = 500;

const useBootstrapData = (
  onSuccess: (bootstrapData?: BootstrapData) => void,
) => {
  const footprintProvider = useFootprintProvider();

  const waitBootstrapDataOrStart = () => {
    const expirationTimeout = setTimeout(() => {
      unsubscribe();
      onSuccess({ email: undefined, phoneNumber: undefined });
    }, WAITING_USER_DATA_TIME);

    const unsubscribe = footprintProvider.on(
      FootprintInternalEvent.bootstrapDataReceived,
      data => {
        clearTimeout(expirationTimeout);
        onSuccess({ email: data.email, phoneNumber: data.phoneNumber });
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
