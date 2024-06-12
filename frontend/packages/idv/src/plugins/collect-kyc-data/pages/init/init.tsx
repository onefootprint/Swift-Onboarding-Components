import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import { getLogger, trackAction } from '../../../../utils/logger';
import { useCollectKycDataMachine } from '../../components/machine-provider';
import type { KycData } from '../../utils/data-types';
import useDecryptKycData from './hooks/use-decrypt-kyc-data/use-decrypt-kyc-data';

const { logError } = getLogger({ location: 'kyc-init' });

const Init = () => {
  const [state, send] = useCollectKycDataMachine();
  const {
    authToken,
    requirement: { populatedAttributes: populatedCdos },
  } = state.context;
  const handleSuccess = (data: KycData) => {
    send({ type: 'initialized', payload: data });
    trackAction('kyc:started');
  };

  const handleError = (err: unknown) => {
    // If we fail to decrypt the existing information on the vault, it's no big deal - we can move
    // forward and just have the user re-enter their info instead of taking the already portable info
    // But log anyways because this shouldn't happen :)
    logError(`Kyc init page failed to decrypt data fields (${populatedCdos.join(', ')}) requested.`, err);
    send({ type: 'initialized', payload: {} });
  };

  useDecryptKycData({
    authToken,
    populatedCdos,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return (
    <Container>
      <AnimatedLoadingSpinner animationStart />
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

export default Init;
