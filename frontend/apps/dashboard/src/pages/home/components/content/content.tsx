import styled, { css } from '@onefootprint/styled';
import { Grid, Stack, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { FormattedOrgMetric } from '../../home.types';

type ContentProps = {
  metrics: FormattedOrgMetric[];
};

const Content = ({ metrics }: ContentProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });

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
            aria-label={t(
              `onboarding-metrics.metrics.${key}` as ParseKeys<'common'>,
            )}
          >
            <Grid.Item gridArea={key}>
              <Stack direction="column" gap={7}>
                <Typography variant="body-3">
                  {t(
                    `onboarding-metrics.metrics.${key}` as ParseKeys<'common'>,
                  )}
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
