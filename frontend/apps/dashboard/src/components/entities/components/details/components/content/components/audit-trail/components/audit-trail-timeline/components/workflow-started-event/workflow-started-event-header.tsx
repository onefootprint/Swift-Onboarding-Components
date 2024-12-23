import { type WorkflowStartedEventData, WorkflowStartedEventKind } from '@onefootprint/types/src/data/timeline';
import { Text } from '@onefootprint/ui';
import { Trans, useTranslation } from 'react-i18next';

import PlaybookLink from '../playbook-link';

type WorkflowStartedEventHeaderProps = {
  data: WorkflowStartedEventData;
};

const WorkflowStartedEventHeader = ({ data }: WorkflowStartedEventHeaderProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.workflow-started-event',
  });

  console.log('data', data);

  if (data.kind === WorkflowStartedEventKind.playbook) {
    let transKey = 'audit-trail.timeline.workflow-started-event.started-onboarding-onto';
    if (data.workflowSource === 'tenant') {
      transKey = 'audit-trail.timeline.workflow-started-event.started-running-playbook';
    }
    return (
      <Text variant="body-3" color="tertiary" display="flex" alignItems="center" gap={2}>
        <Trans
          ns="entity-details"
          i18nKey={transKey}
          components={{
            playbook: <PlaybookLink playbook={data.playbook} />,
          }}
        />
      </Text>
    );
  }
  if (data.kind === WorkflowStartedEventKind.document) {
    return (
      <Text variant="body-3" color="tertiary">
        {t('started-uploading-document')}
      </Text>
    );
  }
  return null;
};

export default WorkflowStartedEventHeader;
