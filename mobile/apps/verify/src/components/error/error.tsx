import { IcoForbid40 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components/native';

import useTranslation from '@/hooks/use-translation';

// TODO: Add navigation header
const ErrorComponent = () => {
  const { t } = useTranslation('components.error');

  return (
    <ErrorContainer>
      <TitleContainer>
        <IcoForbid40 color="error" />
        <Typography variant="heading-3" center>
          {t('title')}
        </Typography>
      </TitleContainer>
      <Typography variant="body-2" center>
        {t('description')}
      </Typography>
    </ErrorContainer>
  );
};

const TitleContainer = styled.View`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
    justify-content: center;
  `}
`;

const ErrorContainer = styled.View`
  ${({ theme }) => css`
    display: flex;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default ErrorComponent;
