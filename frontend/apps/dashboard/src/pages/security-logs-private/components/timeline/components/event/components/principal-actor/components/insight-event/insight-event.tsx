import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const InsightEvent = () => {
  const { t } = useTranslation('security-logs', {
    keyPrefix: 'principal-actor.insight-event',
  });

  return (
    <Stack direction="column" gap={1} backgroundColor="primary" aria-label={t('aria-label')}>
      Placeholder for insight event stuff
    </Stack>
  );
};

export default InsightEvent;
