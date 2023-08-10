import { IcoRepeat40, IcoWarning16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const TooManyAttempts = () => {
  const { t } = useTranslation('components.scan.preview.too-many-attempts');

  return (
    <Container center>
      <Box display="flex" flexDirection="column" gap={3}>
        <Box center>
          <IcoRepeat40 />
          <IconContainer>
            <IcoWarning16 color="error" />
          </IconContainer>
        </Box>
        <Typography center variant="label-1" color="error">
          {t('title')}
        </Typography>
        <Typography center variant="body-2">
          {t('description')}
        </Typography>
      </Box>
    </Container>
  );
};

const IconContainer = styled.View`
  ${({ theme }) => {
    return css`
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      top: -20px;
      left: 16px;
      background: ${theme.backgroundColor.error};
      border-radius: 12px;
      border: ${theme.spacing[1]} solid ${theme.backgroundColor.primary};
      width: 24px;
      height: 24px;
    `;
  }}
`;

export default TooManyAttempts;
