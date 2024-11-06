import { IcoStore24, IcoUsers24 } from '@onefootprint/icons';
import type { OrgMetricsResponse } from '@onefootprint/request-types/dashboard';
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
      <fieldset aria-label={t('users')}>
        <Stack direction="column" gap={5}>
          <Stack gap={3} align="center">
            <IcoUsers24 />
            <Text variant="heading-5">{t('users')}</Text>
          </Stack>
          <Section metrics={metrics.user} />
        </Stack>
      </fieldset>
      {metrics.business.newVaults ? (
        <fieldset aria-label={t('businesses')}>
          <Stack direction="column" gap={5}>
            <Stack gap={3} align="center">
              <IcoStore24 />
              <Text variant="heading-5">{t('businesses')}</Text>
            </Stack>
            <Section metrics={metrics.business} />
          </Stack>
        </fieldset>
      ) : null}
    </Stack>
  );
};

export default Content;
