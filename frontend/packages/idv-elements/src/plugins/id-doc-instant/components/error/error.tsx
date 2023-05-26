import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { IdDocImageError } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import BadImageErrorLabel from '../../constants/bad-image-error-label';
import { imageIcons, ImageTypes } from '../../constants/image-icons';
import FeedbackIcon from '../feedback-icon/feedback-icon';

type ErrorProps = {
  imageType: ImageTypes;
  error: IdDocImageError;
};

const Error = ({ error, imageType }: ErrorProps) => {
  const { t } = useTranslation('components.error');

  return (
    <Container>
      <NavigationHeader />
      <FeedbackIcon
        imageIcon={{ component: imageIcons[imageType], color: 'error' }}
        statusIndicator={{
          component: <IcoWarning16 color="error" />,
          status: 'error',
        }}
      />
      <ErrorMessage>
        <Typography
          variant="label-1"
          color="error"
          sx={{ textAlign: 'center' }}
        >
          {t('title')}
        </Typography>
        <Typography
          variant="body-2"
          color="secondary"
          sx={{
            textAlign: 'center',
          }}
        >
          {BadImageErrorLabel[error] || t('description')}
        </Typography>
      </ErrorMessage>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[5]};
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

export default Error;
