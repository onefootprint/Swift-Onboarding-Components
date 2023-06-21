import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const DeviceWarning = () => {
  const { t } = useTranslation('pages.device-warning');
  return (
    <Container>
      <IcoWarning40 color="error" />
      <Typography
        variant="body-2"
        color="secondary"
        sx={{
          textAlign: 'center',
        }}
      >
        {t('warning')}
      </Typography>
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

export default DeviceWarning;
