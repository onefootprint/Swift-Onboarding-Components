import { useTranslation } from '@onefootprint/hooks';
import {
  type WorkflowStartedEventData,
  WorkflowStartedEventKind,
} from '@onefootprint/types/src/data/timeline';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import PlaybookLink from '../playbook-link';

type WorkflowStartedEventHeaderProps = {
  data: WorkflowStartedEventData;
};

const WorkflowStartedEventHeader = ({
  data,
}: WorkflowStartedEventHeaderProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.workflow-started-event',
  );

  if (data.kind === WorkflowStartedEventKind.playbook) {
    return (
      <>
        <Typography variant="body-3">{t('started-onboarding-onto')}</Typography>
        <PlaybookLink playbook={data.playbook} />
      </>
    );
  }
  if (data.kind === WorkflowStartedEventKind.document) {
    return (
      <Typography variant="body-3">
        {t('started-uploading-document')}
      </Typography>
    );
  }
  return null;
};

export default WorkflowStartedEventHeader;
