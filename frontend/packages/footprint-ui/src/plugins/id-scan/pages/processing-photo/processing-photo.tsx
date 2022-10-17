import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40, IcoClose40 } from '@onefootprint/icons';
import {
  DocStatusType,
  GetDocStatusResponse,
  IdScanBadImageError,
} from '@onefootprint/types';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import HeaderTitle from '../../../../components/header-title';
import { useIdScanMachine } from '../../components/machine-provider';
import IdScanDocTypeToLabel from '../../constants/doc-type-labels';
import { Events } from '../../utils/state-machine/types';
import useGetDocStatus from './hooks/use-get-doc-status';
import useSubmitDoc from './hooks/use-submit-doc';

enum DisplayStatus {
  loading,
  success,
  error,
}

const TRANSITION_DELAY = 3000;

const ProcessingPhoto = () => {
  const { t } = useTranslation('pages.processing-photo');
  const [state, send] = useIdScanMachine();
  const { type, tenant, country, authToken, frontImage, backImage } =
    state.context;
  const docType = type
    ? IdScanDocTypeToLabel[type]
    : t('default-document-label');
  const [displayStatus, setDisplayStatus] = useState<DisplayStatus>(
    DisplayStatus.loading,
  );
  const submitDocMutation = useSubmitDoc();

  useEffectOnce(() => {
    if (!frontImage || !authToken || !tenant || !type || !country) {
      return;
    }
    submitDocMutation.mutate({
      frontImage,
      backImage,
      authToken,
      tenantPk: tenant?.pk,
      documentType: type,
      countryCode: country,
    });
  });

  useGetDocStatus({
    onSuccess: (response: GetDocStatusResponse) => {
      const { status, frontImageError, backImageError } = response;
      if (status === DocStatusType.retryLimitExceeded) {
        handleRetryLimitExceeded();
      } else if (
        status === DocStatusType.error &&
        (frontImageError || backImageError)
      ) {
        handleDocError(frontImageError, backImageError);
      } else if (status === DocStatusType.complete) {
        handleDocSuccess();
      }
    },
  });

  const handleDocSuccess = () => {
    setDisplayStatus(DisplayStatus.success);
    setTimeout(() => {
      send({
        type: Events.imageSucceeded,
      });
    }, TRANSITION_DELAY);
  };

  const handleDocError = (
    frontImageError?: IdScanBadImageError,
    backImageError?: IdScanBadImageError,
  ) => {
    setDisplayStatus(DisplayStatus.error);
    setTimeout(() => {
      send({
        type: Events.imageErrored,
        payload: {
          frontImageError,
          backImageError,
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
      <HeaderTitle
        title={t('title', { type: docType })}
        subtitle={t('subtitle')}
      />
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
    row-gap: ${theme.spacing[9]}px;
    justify-content: center;
    align-items: center;
  `}
`;

export default ProcessingPhoto;
