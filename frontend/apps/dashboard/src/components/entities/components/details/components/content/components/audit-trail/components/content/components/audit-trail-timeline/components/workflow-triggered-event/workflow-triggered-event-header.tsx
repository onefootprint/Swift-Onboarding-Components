import {
  TriggerKind,
  type WorkflowTriggeredEventData,
} from '@onefootprint/types';
import { Shimmer, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import usePlaybook from 'src/components/playbook-details-drawer/hooks/use-playbook';

import Actor from '../actor/actor';
import PlaybookLink from '../playbook-link';

type WorkflowTriggeredEventHeaderProps = {
  data: WorkflowTriggeredEventData;
};

const WorkflowTriggeredEventHeader = ({
  data,
}: WorkflowTriggeredEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.workflow-triggered-event',
  });
  const action = t(`actions.${data.workflow.kind}`);

  return (
    <>
      <Actor actor={data.actor} />
      <Text variant="body-3" color="tertiary" marginLeft={2}>
        {t('requested-user-to', {
          action,
        })}
      </Text>
      <PlaybookContext data={data} />
    </>
  );
};

const PlaybookContext = ({ data }: WorkflowTriggeredEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.workflow-triggered-event',
  });
  const workflowKind = data.workflow.kind;
  const actionHasPlaybook =
    workflowKind === TriggerKind.Onboard ||
    workflowKind === TriggerKind.RedoKyc;
  const { data: playbook, isError } = usePlaybook(
    (actionHasPlaybook && data.request?.playbookId) || '',
  );
  if (!actionHasPlaybook) {
    return null;
  }
  if (isError) {
    return (
      <Text variant="body-3" color="tertiary">
        {t('playbook')}
      </Text>
    );
  }
  return playbook ? (
    <PlaybookLink playbook={playbook} />
  ) : (
    <Shimmer
      sx={{
        width: '120px',
        height: '20px',
      }}
    />
  );
};

export default WorkflowTriggeredEventHeader;
