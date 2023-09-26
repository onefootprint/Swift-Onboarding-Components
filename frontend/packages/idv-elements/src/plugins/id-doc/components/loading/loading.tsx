import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import type { IdDocImageTypes } from '@onefootprint/types';
import { Box, LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

export type LoadingProps = {
  imageType: IdDocImageTypes;
};

const Loading = ({ imageType }: LoadingProps) => {
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
          sx={{ textAlign: 'center', color: 'tertiary' }}
        >
          {t('subtitle')}
        </Typography>
      </Box>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Loading;
