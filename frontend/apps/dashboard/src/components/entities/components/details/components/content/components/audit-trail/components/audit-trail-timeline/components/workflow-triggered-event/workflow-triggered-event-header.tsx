import { TriggerKind, type WorkflowTriggeredEventData } from '@onefootprint/types';
import { Shimmer, Text } from '@onefootprint/ui';
import { Trans, useTranslation } from 'react-i18next';
import usePlaybook from 'src/components/playbooks/playbook-details/hooks/use-playbook';

import Actor from '../actor/actor';
import PlaybookLink from '../playbook-link';
import useGetActionName from './hooks/use-get-action-name';

type WorkflowTriggeredEventHeaderProps = {
  data: WorkflowTriggeredEventData;
};

const WorkflowTriggeredEventHeader = ({ data }: WorkflowTriggeredEventHeaderProps) => {
  const getActionName = useGetActionName();
  const action = getActionName(data.config);

  return (
    <>
      <Text variant="body-3" color="tertiary" display="flex" gap={2}>
        <Trans
          ns="entity-details"
          i18nKey="audit-trail.timeline.workflow-triggered-event.user-requested-to"
          values={{ action }}
          components={{
            playbook: <PlaybookContext data={data} />,
            actor: <Actor actor={data.actor} />,
          }}
        />
      </Text>
    </>
  );
};

const PlaybookContext = ({ data }: WorkflowTriggeredEventHeaderProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.workflow-triggered-event',
  });

  const playbookId = data.config.kind === TriggerKind.Onboard ? data.config.data.playbookId : '';
  const { data: playbook, isError } = usePlaybook(playbookId);
  if (!playbookId) {
    return null;
  }
  if (isError) {
    return (
      <Text variant="body-3" color="tertiary">
        {t('playbook')}
      </Text>
    );
  }
  return playbook ? <PlaybookLink playbook={playbook} /> : <Shimmer width="120px" height="20px" />;
};

export default WorkflowTriggeredEventHeader;
