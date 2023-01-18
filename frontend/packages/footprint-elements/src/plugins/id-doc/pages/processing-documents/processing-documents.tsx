import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { DocStatusKind } from '@onefootprint/types';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useEffectOnce, useTimeout } from 'usehooks-ts';

import HeaderTitle from '../../../../components/header-title';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import Error from './components/error';
import Loading from './components/loading/loading';
import RetryLimitExceeded from './components/retry-limit-exceeded';
import Success from './components/success';
import usePollDocStatus from './hooks/use-poll-doc-status';
import useSubmitDoc from './hooks/use-submit-doc';

const LOADING_TIMEOUT = 10000;

const ProcessingDocuments = () => {
  const { t } = useTranslation('pages.processing-documents');
  const [state] = useIdDocMachine();
  const {
    idDoc: { type, country, frontImage, backImage },
    selfie: { image: selfieImage },
    authToken,
    requestId,
  } = state.context;

  const submitDocMutation = useSubmitDoc();
  const showRequestErrorToast = useRequestErrorToast();
  const [status, setStatus] = useState<DocStatusKind>(DocStatusKind.pending);
  const { start, stop, result } = usePollDocStatus({
    onSuccess: response => {
      setStatus(response.status.kind);
    },
    // Polling errored out in an unrecoverable way: show error page, let user retry uploading
    onError: (error: unknown) => {
      showRequestErrorToast(error);
      setStatus(DocStatusKind.error);
    },
  });

  useEffectOnce(() => {
    if (!frontImage || !authToken || !type || !country || !requestId) {
      return;
    }
    submitDocMutation.mutate(
      {
        frontImage,
        backImage,
        selfieImage,
        authToken,
        documentType: type,
        countryCode: country,
        requestId,
      },
      {
        // Only start polling after the document upload is successful
        onSuccess: () => start(),
        // If there is an unrecoverable error, show error page & let user retry uploading
        onError: error => {
          showRequestErrorToast(error);
          setStatus(DocStatusKind.error);
        },
      },
    );
  });

  // If we are stuck in loading state for 10 seconds, error out & retry uploading
  useTimeout(
    () => {
      stop();
      setStatus(DocStatusKind.error);
    },
    status === DocStatusKind.pending ? LOADING_TIMEOUT : null,
  );

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      {status === DocStatusKind.pending && <Loading />}
      {status === DocStatusKind.complete && <Success />}
      {status === DocStatusKind.error && <Error errors={result.data?.errors} />}
      {status === DocStatusKind.retryLimitExceeded && <RetryLimitExceeded />}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[9]};
    justify-content: center;
    align-items: center;
  `}
`;

export default ProcessingDocuments;
