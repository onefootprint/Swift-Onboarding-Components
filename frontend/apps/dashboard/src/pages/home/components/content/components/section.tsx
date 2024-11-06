import type { OrgMetricsResponse } from '@onefootprint/request-types/dashboard';
import { Box, Grid, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

type SectionProps = {
  metrics: OrgMetricsResponse['business'] | OrgMetricsResponse['user'];
};

const Section = ({ metrics }: SectionProps) => {
  const { t } = useTranslation('home');
  const formattedMetrics = formatMetrics(metrics);

  return (
    <Grid.Container gap={5} columns={['repeat(3, 1fr)']}>
      {formattedMetrics.map(({ key, value }) => {
        const translationKey = `onboarding-metrics.metrics.${key}` as ParseKeys<'common'>;
        const displayValue = typeof value === 'number' ? value.toLocaleString('en-US') : value;

        return (
          <section aria-label={t(translationKey)}>
            <Box
              borderColor="tertiary"
              borderRadius="default"
              borderStyle="solid"
              borderWidth={1}
              key={key}
              padding={5}
            >
              <Grid.Item gridArea={key}>
                <Stack direction="column" gap={7}>
                  <Text variant="body-2">{t(translationKey)}</Text>
                  <Text variant="display-3">{displayValue}</Text>
                </Stack>
              </Grid.Item>
            </Box>
          </section>
        );
      })}
    </Grid.Container>
  );
};

const calculatePassRate = (passOnboardings: number, failOnboardings: number): string => {
  if (passOnboardings === 0) return '0%';

  const rate = (passOnboardings / (passOnboardings + failOnboardings)) * 100;
  return `${rate % 1 === 0 ? rate : rate.toFixed(1)}%`;
};

const formatMetrics = (
  metrics: SectionProps['metrics'],
): {
  key: string;
  value: number | string;
}[] => {
  const passRate = calculatePassRate(metrics.passOnboardings, metrics.failOnboardings);

  return [
    { key: 'pass', value: metrics.passOnboardings },
    { key: 'fail', value: metrics.failOnboardings },
    { key: 'incomplete', value: metrics.incompleteOnboardings },
    { key: 'total', value: metrics.totalOnboardings },
    { key: 'pass-rate', value: passRate },
    { key: 'new-vaults', value: metrics.newVaults },
  ];
};

export default Section;
