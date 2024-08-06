import type { ExternalIntegrationCalledData } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import EventBodyEntry from '../event-body-entry';

type WorkflowTriggeredEventBodyProps = {
  data: ExternalIntegrationCalledData;
};

const WorkflowTriggeredEventBody = ({ data }: WorkflowTriggeredEventBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.external-integration-called',
  });

  return (
    <EventBodyEntry
      content={
        <Text variant="label-3" color="secondary">
          {t('uuid')}
          <Text variant="body-3" color="tertiary" marginLeft={2}>
            {data.externalId}
          </Text>
        </Text>
      }
    />
  );
};

export default WorkflowTriggeredEventBody;
