import {
  FootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/footprint-elements';
import { BootstrapData } from 'src/hooks/use-bifrost-machine';
import { useEffectOnce } from 'usehooks-ts';

const useBootstrapData = (
  onSuccess: (bootstrapData?: BootstrapData) => void,
) => {
  const footprintProvider = useFootprintProvider();

  useEffectOnce(() => {
    footprintProvider.ready();
  });

  useEffectOnce(() => {
    footprintProvider.on(FootprintInternalEvent.bootstrapDataReceived, data => {
      if (data.email || data.phoneNumber) {
        onSuccess({
          email: data.email,
          phoneNumber: data.phoneNumber,
        });
      }
    });
  });
};

export default useBootstrapData;
