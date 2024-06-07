import { Grid, Stack, Text } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { FormattedOrgMetric } from '../../home.types';

type ContentProps = {
  metrics: FormattedOrgMetric[];
};

const Content = ({ metrics }: ContentProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });

  return (
    <div data-testid="onboarding-metrics-content">
      <Grid.Container gap={5} columns={['repeat(3, 1fr)']} templateAreas={Object.keys(metrics)}>
        <AnimatePresence>
          {metrics.map(({ key, value }) => (
            <BorderBox
              key={key}
              role="group"
              initial={{ opacity: 0, filter: 'blur(1px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{
                opacity: 0,
                filter: 'blur(1px)',
                transition: { duration: 0.2 },
              }}
              aria-label={t(`onboarding-metrics.metrics.${key}` as ParseKeys<'common'>)}
            >
              <Grid.Item gridArea={key}>
                <Stack direction="column" gap={7}>
                  <Text variant="body-3">{t(`onboarding-metrics.metrics.${key}` as ParseKeys<'common'>)}</Text>
                  <Text variant="display-3">{value.toLocaleString('en-US')}</Text>
                </Stack>
              </Grid.Item>
            </BorderBox>
          ))}
        </AnimatePresence>
      </Grid.Container>
    </div>
  );
};

const BorderBox = styled(motion.div)`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default Content;
