import { IcoStore24, IcoUsers24 } from '@onefootprint/icons';
import type { OrgMetricsResponse } from '@onefootprint/types/src/data';
import { Stack } from '@onefootprint/ui';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Section from './components/section';

type ContentProps = {
  metrics: OrgMetricsResponse;
};

const Content = ({ metrics }: ContentProps) => {
  const { t } = useTranslation('home');

  return (
    <Stack direction="column" gap={9}>
      <Stack direction="column" gap={5} aria-label={t('users')} role="group">
        <Stack gap={2} align="center">
          <IcoUsers24 />
          <Text variant="label-2">{t('users')}</Text>
        </Stack>
        <Section metrics={metrics.user} />
      </Stack>
      {metrics.business.newVaults ? (
        <Stack direction="column" gap={5} aria-label={t('businesses')} role="group">
          <Stack gap={2} align="center">
            <IcoStore24 />
            <Text variant="label-2">{t('businesses')}</Text>
          </Stack>
          <Section metrics={metrics.business} />
        </Stack>
      ) : null}
    </Stack>
  );
};

export default Content;
