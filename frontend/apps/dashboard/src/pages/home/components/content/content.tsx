import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Grid, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import type { FormattedOrgMetric } from '../../home.types';

type ContentProps = {
  metrics: FormattedOrgMetric[];
};

const Content = ({ metrics }: ContentProps) => {
  const { t } = useTranslation('pages.home');

  return (
    <div data-testid="onboarding-metrics-content">
      <Grid.Container
        gap={5}
        columns={['repeat(3, 1fr)']}
        templateAreas={Object.keys(metrics)}
      >
        {metrics.map(({ key, value }) => (
          <BorderBox
            key={key}
            role="group"
            aria-label={t(`onboarding-metrics.metrics.${key}`)}
          >
            <Grid.Item gridArea={key}>
              <Stack direction="column" gap={7}>
                <Typography variant="body-3">
                  {t(`onboarding-metrics.metrics.${key}`)}
                </Typography>
                <Typography variant="display-3">
                  {value.toLocaleString('en-US')}
                </Typography>
              </Stack>
            </Grid.Item>
          </BorderBox>
        ))}
      </Grid.Container>
    </div>
  );
};

const BorderBox = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default Content;
