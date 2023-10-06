import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { IdDocImageTypes } from '@onefootprint/types';
import { Box, LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

export type LoadingProps = {
  imageType: IdDocImageTypes;
  showSlowConnectionMessage?: boolean;
};

const Loading = ({ imageType, showSlowConnectionMessage }: LoadingProps) => {
  const { t } = useTranslation('components.loading');

  return (
    <Container>
      <LoadingIndicator />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <Typography
          variant="label-1"
          sx={{ marginTop: 5, textAlign: 'center' }}
        >
          {t(`title.processing-${imageType}`)}
        </Typography>
        <Typography
          variant="body-4"
          sx={{
            textAlign: 'center',
            color: showSlowConnectionMessage ? 'error' : 'tertiary',
          }}
        >
          {showSlowConnectionMessage ? t('slow-connection') : t('subtitle')}
        </Typography>
      </Box>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: ${theme.spacing[6]};
  `}
`;

export default Loading;
