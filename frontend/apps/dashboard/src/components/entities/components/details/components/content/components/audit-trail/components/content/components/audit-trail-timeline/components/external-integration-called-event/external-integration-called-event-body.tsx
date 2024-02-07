import type { ExternalIntegrationCalledData } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import EventBodyEntry from '../event-body-entry';

type WorkflowTriggeredEventBodyProps = {
  data: ExternalIntegrationCalledData;
};

const WorkflowTriggeredEventBody = ({
  data,
}: WorkflowTriggeredEventBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.external-integration-called',
  });

  return (
    <EventBodyEntry
      content={
        <Typography variant="label-3" color="secondary">
          {t('uuid')}
          <Typography variant="body-3" color="tertiary" sx={{ marginLeft: 2 }}>
            {data.externalId}
          </Typography>
        </Typography>
      }
    />
  );
};

export default WorkflowTriggeredEventBody;
