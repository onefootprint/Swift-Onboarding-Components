import type { LivenessEventData } from '@onefootprint/types';
import { LivenessSource } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type LivenessEventHeaderProps = {
  data: LivenessEventData;
};

const LivenessEventHeader = ({ data }: LivenessEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.liveness-event',
  });
  const { source } = data;

  return (
    <Text variant="label-3" testID="liveness-event-header">
      {source === LivenessSource.skipped ? t('skipped-title') : t('success-title')}
    </Text>
  );
};

export default LivenessEventHeader;
