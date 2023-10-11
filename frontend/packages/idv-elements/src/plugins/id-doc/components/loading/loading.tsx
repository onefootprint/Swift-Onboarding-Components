import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { IdDocImageTypes } from '@onefootprint/types';
import { LoadingIndicator, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

type Step = 'process' | 'upload' | 'analyze';

export type LoadingProps = {
  imageType: IdDocImageTypes;
  step: Step;
  showSlowConnectionMessage?: boolean;
};

const Loading = ({
  imageType,
  step,
  showSlowConnectionMessage,
}: LoadingProps) => {
  const { t } = useTranslation('components.loading');

  return (
    <Container>
      <LoadingIndicator />
      <Stack direction="column" justify="center" align="center" gap={3}>
        <Typography
          variant="label-1"
          sx={{ marginTop: 5, textAlign: 'center' }}
        >
          {t(`title.${step}-${imageType}`)}
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
      </Stack>
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
