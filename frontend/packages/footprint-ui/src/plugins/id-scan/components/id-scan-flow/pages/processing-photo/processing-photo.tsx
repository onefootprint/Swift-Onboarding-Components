import { useTranslation } from 'hooks';
import { IcoCheckCircle40, IcoClose40 } from 'icons';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { IdScanBadImageError } from 'types';
import { LoadingIndicator, Typography } from 'ui';

import { HeaderTitle } from '../../../../../../components';
import IdScanDocTypeToLabel from '../../../../constants/doc-type-labels';
import { Events } from '../../../../utils/state-machine/types';
import { useIdScanMachine } from '../../../machine-provider';
import useCheckPhotoStatus from './hooks/use-check-photo-status';

enum Status {
  loading,
  success,
  error,
}

const TRANSITION_DELAY = 3000;

const ProcessingPhoto = () => {
  const { t } = useTranslation('pages.processing-photo');
  const [state, send] = useIdScanMachine();
  const type = state.context.type
    ? IdScanDocTypeToLabel[state.context.type]
    : t('default-document-label');
  const [status, setStatus] = useState<Status>(Status.loading);

  useCheckPhotoStatus({
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
  });

  return (
    <Container>
      <HeaderTitle title={t('title', { type })} subtitle={t('subtitle')} />
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
