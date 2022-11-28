import { BootstrapData } from 'src/hooks/use-bifrost-machine';
import { useEffectOnce } from 'usehooks-ts';

const useBootstrapData = (
  onSuccess: (bootstrapData: BootstrapData) => void,
) => {
  // TODO: derive this from the url or the post message
  // For now, we are using a placeholder
  useEffectOnce(() => {
    onSuccess({
      // TODO: uncomment values below for testing/demo
      // email: 'belce.dogru@gmail.com',
      // email: 'belce@onefootprint.com',
      // phoneNumber: '+16504600700',
      // phoneNumber: '+12143266968',
    });
  });
};

export default useBootstrapData;
