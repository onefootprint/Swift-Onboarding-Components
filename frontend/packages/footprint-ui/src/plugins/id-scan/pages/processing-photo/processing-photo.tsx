import { useTranslation } from '@onefootprint/hooks';
import { IdScanBadImageError } from '@onefootprint/types';
import { IcoCheckCircle40, IcoClose40 } from 'icons';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { LoadingIndicator, Typography } from 'ui';

import HeaderTitle from '../../../../components/header-title';
import { useIdScanMachine } from '../../components/machine-provider';
import IdScanDocTypeToLabel from '../../constants/doc-type-labels';
import { Events } from '../../utils/state-machine/types';
import useSubmitPhoto from './hooks/use-submit-photo';

enum Status {
  loading,
  success,
  error,
}

const TRANSITION_DELAY = 3000;

const ProcessingPhoto = () => {
  const { t } = useTranslation('pages.processing-photo');
  const [state, send] = useIdScanMachine();
  const { type, frontImage, backImage } = state.context;
  const docType = type
    ? IdScanDocTypeToLabel[type]
    : t('default-document-label');
  const [status, setStatus] = useState<Status>(Status.loading);

  useSubmitPhoto(
    {
      front: frontImage,
      back: backImage,
    },
    {
      onSuccess: () => {
        setStatus(Status.success);
        setTimeout(() => {
          send({
            type: Events.imageSucceeded,
          });
        }, TRANSITION_DELAY);
      },
      onError: (
        frontImageError?: IdScanBadImageError,
        backImageError?: IdScanBadImageError,
      ) => {
        setStatus(Status.error);
        setTimeout(() => {
          send({
            type: Events.imageFailed,
            payload: {
              frontImageError,
              backImageError,
            },
          });
        }, TRANSITION_DELAY);
      },
    },
  );

  return (
    <Container>
      <HeaderTitle
        title={t('title', { type: docType })}
        subtitle={t('subtitle')}
      />
      {status === Status.loading && (
        <>
          <LoadingIndicator />
          <Typography variant="label-3">{t('loading')}</Typography>
        </>
      )}
      {status === Status.success && (
        <>
          <IcoCheckCircle40 color="success" />
          <Typography variant="label-3" color="success">
            {t('success')}
          </Typography>
        </>
      )}
      {status === Status.error && (
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
