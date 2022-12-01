import {
  FootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/footprint-elements';
import { BootstrapData } from 'src/hooks/use-bifrost-machine';
import { useEffectOnce } from 'usehooks-ts';

const WAITING_USER_DATA_TIME = 250;

const useBootstrapData = (
  onSuccess: (bootstrapData?: BootstrapData) => void,
) => {
  const footprintProvider = useFootprintProvider();

  useEffectOnce(() => {
    footprintProvider.ready();
    const unsubscribe = footprintProvider.on(
      FootprintInternalEvent.bootstrapDataReceived,
      data => {
        onSuccess({ email: data.email, phoneNumber: data.phoneNumber });
      },
    );

    setTimeout(() => {
      unsubscribe();
      onSuccess({ email: undefined, phoneNumber: undefined });
    }, WAITING_USER_DATA_TIME);
  });
};

export default useBootstrapData;
