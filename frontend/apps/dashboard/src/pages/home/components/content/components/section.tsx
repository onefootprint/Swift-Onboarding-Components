import { Grid, Stack, Text } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { OrgMetrics } from '@onefootprint/types/src/data';

type SectionProps = {
  metrics: OrgMetrics;
};

const Section = ({ metrics }: SectionProps) => {
  const { t } = useTranslation('home');

  const formattedMetrics = [];

  const passRateValue =
    metrics.passOnboardings === 0
      ? 0
      : (metrics.passOnboardings / (metrics.passOnboardings + metrics.failOnboardings)) * 100;
  const passRate = passRateValue % 1 === 0 ? passRateValue : passRateValue.toFixed(1);

  formattedMetrics.push(
    {
      key: 'pass',
      value: metrics.passOnboardings,
    },
    {
      key: 'fail',
      value: metrics.failOnboardings,
    },
    {
      key: 'incomplete',
      value: metrics.incompleteOnboardings,
    },
    { key: 'total', value: metrics.totalOnboardings },
    { key: 'pass-rate', value: `${passRate}%` },
    { key: 'new-vaults', value: metrics.newVaults },
  );

  return (
    <Grid.Container gap={5} columns={['repeat(3, 1fr)']}>
      <AnimatePresence>
        {formattedMetrics.map(({ key, value }) => (
          <BorderBox
            key={key}
            role="region"
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
  );
};

const BorderBox = styled(motion.div)`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default Section;
