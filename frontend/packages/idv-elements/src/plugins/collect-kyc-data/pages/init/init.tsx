import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';

import Logger from '../../../../utils/logger';
import { useCollectKycDataMachine } from '../../components/machine-provider';
import type { KycData } from '../../utils/data-types';
import useDecryptKycData from './hooks/use-decrypt-kyc-data/use-decrypt-kyc-data';

const Init = () => {
  const [state, send] = useCollectKycDataMachine();
  const {
    authToken,
    requirement: { populatedAttributes: populatedCdos },
  } = state.context;
  const handleSuccess = (data: KycData) => {
    send({
      type: 'initialized',
      payload: data,
    });
  };

  const handleError = (err: any) => {
    // If we fail to decrypt the existing information on the vault, it's no big deal - we can move
    // forward and just have the user re-enter their info instead of taking the already portable info
    // But log anyways because this shouldn't happen :)
    Logger.error(
      `Kyc init page failed to decrypt data fields (${populatedCdos.join(
        ', ',
      )}) requested. ${getErrorMessage(err)}`,
      'kyc-init',
    );
    send({
      type: 'initialized',
      payload: {},
    });
  };

  useDecryptKycData({
    authToken,
    populatedCdos,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return (
    <Container>
      <LoadingIndicator />
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
