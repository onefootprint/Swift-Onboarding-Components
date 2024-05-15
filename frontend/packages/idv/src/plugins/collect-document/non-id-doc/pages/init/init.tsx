import { IcoWarning24 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { AnimatedLoadingSpinner, Button, Text } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { Logger } from '../../../../../utils';
import useSubmitDocType from '../../../hooks/use-submit-doc-type';
import { useNonIdDocMachine } from '../../components/machine-provider';
import type { NonIdDocKinds } from '../../types';
import requestKindToDocType from '../../utils/request-kind-to-doc-type';

const Init = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.non-id-doc.pages.init',
  });
  const [state, send] = useNonIdDocMachine();
  const { authToken, device, config, documentRequestId } = state.context;
  const submitDocTypeMutation = useSubmitDocType();
  const { isError } = submitDocTypeMutation;
  const [numRetries, setNumRetries] = useState(0);
  const retryLimitExceeded = numRetries >= 3;

  useEffect(() => {
    submitDocTypeMutation.mutate(
      {
        authToken,
        documentType: requestKindToDocType[config.kind as NonIdDocKinds],
        requestId: documentRequestId,
        deviceType: device.type === 'mobile' ? 'mobile' : 'desktop',
      },
      {
        onSuccess: data => {
          send({
            type: 'contextInitialized',
            payload: {
              id: data.id,
            },
          });
        },
        onError: err => {
          const errorMsg = getErrorMessage(err);
          Logger.error(
            `Failed to submit non id-doc document type ${config.kind}. Error: ${errorMsg}`,
            { location: 'id-doc-country-and-type-container' },
          );
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numRetries]);

  const handleRetry = () => {
    setNumRetries(prev => prev + 1);
  };

  if (isError) {
    return (
      <ErrorContainer>
        <ErrorMessage>
          <IcoWarning24 color="error" />
          {retryLimitExceeded ? (
            <Text variant="body-2" color="secondary" textAlign="center">
              {t('retry-limit-exceeded')}
            </Text>
          ) : (
            <Text variant="body-2" color="secondary" textAlign="center">
              {t('error')}
            </Text>
          )}
        </ErrorMessage>
        {!retryLimitExceeded && (
          <Button onClick={handleRetry}>{t('try-again')}</Button>
        )}
      </ErrorContainer>
    );
  }

  return (
    <LoadingContainer>
      <AnimatedLoadingSpinner animationStart />
    </LoadingContainer>
  );
};

const LoadingContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

const ErrorContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
  `}
`;

const ErrorMessage = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

export default Init;
