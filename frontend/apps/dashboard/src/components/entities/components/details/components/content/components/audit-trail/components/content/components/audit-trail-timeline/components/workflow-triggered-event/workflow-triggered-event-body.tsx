import { useTranslation } from '@onefootprint/hooks';
import type { WorkflowTriggeredEventData } from '@onefootprint/types';
import { LinkButton, Stack, Tooltip, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import EventBodyEntry from '../event-body-entry';
import useGenerateTriggerLink from './hooks/use-generate-trigger-link';

type WorkflowTriggeredEventBodyProps = {
  data: WorkflowTriggeredEventData;
  entityId: string;
};

const HIDE_TIMEOUT = 1000;

let confirmationTimeout: null | NodeJS.Timeout = null;

const WorkflowTriggeredEventBody = ({
  data,
  entityId,
}: WorkflowTriggeredEventBodyProps) => {
  const generateTriggerLink = useGenerateTriggerLink();
  const [confirmationTooltipMessage, setConfirmationTooltipMessage] = useState<
    string | null
  >(null);
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.workflow-triggered-event',
  );
  const shouldShowCopyButton = data.request?.isDeactivated === false;

  const clearTooltipTimeout = () => {
    if (confirmationTimeout) {
      clearTimeout(confirmationTimeout);
      confirmationTimeout = null;
    }
  };

  const scheduleToHideConfirmation = (timeout: number) => {
    confirmationTimeout = setTimeout(() => {
      setConfirmationTooltipMessage(null);
    }, timeout);
  };

  const showTooltipMessage = (msg: string, timeout = HIDE_TIMEOUT) => {
    clearTooltipTimeout();
    setConfirmationTooltipMessage(msg);
    scheduleToHideConfirmation(timeout);
  };

  const generateLinkAndCopyToClipboard = () => {
    const triggerId = data.request?.id;
    if (!triggerId) {
      return;
    }
    generateTriggerLink.mutate(
      {
        entityId,
        triggerId,
      },
      {
        onSuccess: ({ link }) => {
          navigator.clipboard.writeText(link);
          showTooltipMessage(t('tooltip.copied'));
        },
        onError: () => {
          showTooltipMessage(t('tooltip.couldnt-copy'), 3000);
        },
      },
    );
  };

  return (
    <EventBodyEntry
      content={
        <Stack gap={2}>
          <Typography variant="body-3" as="span" sx={{ marginRight: 1 }}>
            {t('link-sent')}
          </Typography>
          {shouldShowCopyButton && (
            <>
              <Stack
                align="center"
                justify="center"
                marginLeft={2}
                marginRight={2}
              >
                ·
              </Stack>
              <Tooltip
                position="right"
                alignment="center"
                text={confirmationTooltipMessage || ''}
                open={!!confirmationTooltipMessage}
              >
                <LinkButton
                  size="compact"
                  onClick={generateLinkAndCopyToClipboard}
                  disabled={generateTriggerLink.isLoading}
                >
                  {t('copy-link')}
                </LinkButton>
              </Tooltip>
            </>
          )}
        </Stack>
      }
      testID="workflow-triggered-event-body"
    />
  );
};

export default WorkflowTriggeredEventBody;
