import { type WorkflowTriggeredEventData } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Actor from '../actor/actor';

type WorkflowTriggeredEventHeaderProps = {
  data: WorkflowTriggeredEventData;
};

const WorkflowTriggeredEventHeader = ({
  data,
}: WorkflowTriggeredEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.workflow-triggered-event',
  });
  const workflowKind = data.workflow.kind;
  const action = t(`actions.${workflowKind}`);

  return (
    <>
      <Actor actor={data.actor} />
      <Text variant="body-3" color="tertiary" marginLeft={2}>
        {t('requested-user-to', {
          action,
        })}
      </Text>
    </>
  );
};

export default WorkflowTriggeredEventHeader;
