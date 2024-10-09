import { LoadingSpinner, Stack } from '@onefootprint/ui';

import { getLogger, trackAction } from '../../../../utils/logger';
import { useCollectKycDataMachine } from '../../components/machine-provider';
import type { KycData } from '../../utils/data-types';
import useDecryptKycData from './hooks/use-decrypt-kyc-data/use-decrypt-kyc-data';

const { logError } = getLogger({ location: 'kyc-init' });

const Init = () => {
  const [state, send] = useCollectKycDataMachine();
  const {
    authToken,
    requirement: { populatedAttributes },
  } = state.context;
  const handleSuccess = (data: KycData) => {
    send({ type: 'initialized', payload: data });
    trackAction('kyc:started');
  };

  const handleError = (err: unknown) => {
    // If we fail to decrypt the existing information on the vault, it's no big deal - we can move
    // forward and just have the user re-enter their info instead of taking the already portable info
    // But log anyways because this shouldn't happen :)
    logError(`Kyc init page failed to decrypt data fields (${populatedAttributes.join(', ')}) requested.`, err);
    send({ type: 'initialized', payload: {} });
  };

  useDecryptKycData({
    authToken,
    populatedCdos: populatedAttributes,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return (
    <Stack
      height="100%"
      minHeight="var(--loading-container-min-height)"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      <LoadingSpinner />
    </Stack>
  );
};

export default Init;
