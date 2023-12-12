import { useTranslation } from '@onefootprint/hooks';
import { type WorkflowTriggeredEventData } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import Actor from '../actor/actor';

type WorkflowTriggeredEventHeaderProps = {
  data: WorkflowTriggeredEventData;
};

const WorkflowTriggeredEventHeader = ({
  data,
}: WorkflowTriggeredEventHeaderProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.workflow-triggered-event',
  );
  const workflowKind = data.workflow.kind;
  const action = t(`actions.${workflowKind}`);

  return (
    <>
      <Actor actor={data.actor} />
      <Typography variant="body-3">
        {t('requested-user-to', {
          action,
        })}
        {data.note && t('with-note')}
      </Typography>
    </>
  );
};

export default WorkflowTriggeredEventHeader;
