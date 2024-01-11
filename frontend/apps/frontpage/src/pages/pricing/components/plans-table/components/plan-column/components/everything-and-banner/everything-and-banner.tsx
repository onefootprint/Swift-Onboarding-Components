import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import type { Plans } from '../../../../plans-table-types';

type EverythingAndBannerProps = {
  plan: Plans;
};

const EverythingAndBanner = ({ plan }: EverythingAndBannerProps) => {
  const { t } = useTranslation('pages.pricing');

  return (
    <Container direction="column" gap={2}>
      <Typography variant="label-3" color="tertiary">
        {t(`plans.${plan}.everything-and`)}
      </Typography>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[2]};
  `}
`;

export default EverythingAndBanner;
