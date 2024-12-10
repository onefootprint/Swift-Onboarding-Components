import type { OrgMetricsResponse } from '@onefootprint/request-types/dashboard';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

type SectionProps = {
  metrics: OrgMetricsResponse['business'] | OrgMetricsResponse['user'];
};

const Section = ({ metrics }: SectionProps) => {
  const { t } = useTranslation('home');
  const formattedMetrics = formatMetrics(metrics);

  return (
    <div className="grid grid-cols-3 gap-4">
      {formattedMetrics.map(({ key, value }) => {
        const translationKey = `onboarding-metrics.metrics.${key}` as ParseKeys<'common'>;
        const displayValue = typeof value === 'number' ? value.toLocaleString('en-US') : value;

        return (
          <section key={key} aria-label={t(translationKey)}>
            <div className="border border-solid border-tertiary rounded p-4">
              <div className="flex flex-col gap-6">
                <div className="text-body-2">{t(translationKey)}</div>
                <div className="text-display-3">{displayValue}</div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
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
