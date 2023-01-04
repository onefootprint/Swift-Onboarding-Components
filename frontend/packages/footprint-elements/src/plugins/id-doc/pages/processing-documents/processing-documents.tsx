import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40, IcoClose40 } from '@onefootprint/icons';
import {
  DocStatusKind,
  GetDocStatusResponse,
  IdDocBadImageError,
} from '@onefootprint/types';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import HeaderTitle from '../../../../components/header-title';
import useIdDocMachine, { Events } from '../../hooks/use-id-doc-machine';
import useGetDocStatus from './hooks/use-get-doc-status';
import useSubmitDoc from './hooks/use-submit-doc';

enum DisplayStatus {
  loading,
  success,
  error,
}

const TRANSITION_DELAY = 3000;

const ProcessingDocuments = () => {
  const { t } = useTranslation('pages.processing-documents');
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type, country, frontImage, backImage },
    authToken,
    requestId,
  } = state.context;
  const [displayStatus, setDisplayStatus] = useState<DisplayStatus>(
    DisplayStatus.loading,
  );
  const submitDocMutation = useSubmitDoc();

  useEffectOnce(() => {
    if (!frontImage || !authToken || !type || !country || !requestId) {
      return;
    }
    // TODO: Submit selfie to the backend
    // https://linear.app/footprint/issue/FP-1996/integrate-with-bifrost-apis
    submitDocMutation.mutate({
      frontImage,
      backImage,
      authToken,
      documentType: type,
      countryCode: country,
      requestId,
    });
  });

  useGetDocStatus({
    onSuccess: (response: GetDocStatusResponse) => {
      const {
        status: { kind },
        frontImageError,
        backImageError,
      } = response;
      if (kind === DocStatusKind.retryLimitExceeded) {
        handleRetryLimitExceeded();
      } else if (
        kind === DocStatusKind.error &&
        (frontImageError || backImageError)
      ) {
        handleDocError(frontImageError, backImageError);
      } else if (kind === DocStatusKind.complete) {
        handleDocSuccess();
      }
    },
  });

  const handleDocSuccess = () => {
    setDisplayStatus(DisplayStatus.success);
    setTimeout(() => {
      send({
        type: Events.succeeded,
      });
    }, TRANSITION_DELAY);
  };

  const handleDocError = (
    frontImageError?: IdDocBadImageError,
    backImageError?: IdDocBadImageError,
  ) => {
    setDisplayStatus(DisplayStatus.error);
    setTimeout(() => {
      send({
        type: Events.errored,
        payload: {
          idDocFrontImageError: frontImageError,
          idDocBackImageError: backImageError,
        },
      });
    }, TRANSITION_DELAY);
  };

  const handleRetryLimitExceeded = () => {
    setDisplayStatus(DisplayStatus.error);
    setTimeout(() => {
      send({
        type: Events.retryLimitExceeded,
      });
    }, TRANSITION_DELAY);
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      {displayStatus === DisplayStatus.loading && (
        <>
          <LoadingIndicator />
          <Typography variant="label-3">{t('loading')}</Typography>
        </>
      )}
      {displayStatus === DisplayStatus.success && (
        <>
          <IcoCheckCircle40 color="success" />
          <Typography variant="label-3" color="success">
            {t('success')}
          </Typography>
        </>
      )}
      {displayStatus === DisplayStatus.error && (
        <>
          <IcoClose40 color="error" />
          <Typography variant="label-3" color="error">
            {t('error')}
          </Typography>
        </>
      )}
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
