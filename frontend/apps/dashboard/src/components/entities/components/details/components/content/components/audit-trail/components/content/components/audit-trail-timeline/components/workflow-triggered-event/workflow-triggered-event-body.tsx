import { IcoInfo16 } from '@onefootprint/icons';
import type { WorkflowTriggeredEventData } from '@onefootprint/types';
import { Box, LinkButton, Stack, Tooltip, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.workflow-triggered-event',
  });
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
    <Stack gap={3} direction="column">
      {data.note && (
        <EventBodyEntry
          testID="workflow-triggered-event-body-note"
          iconComponent={null}
          content={
            <Box
              backgroundColor="secondary"
              borderRadius="default"
              paddingLeft={3}
              paddingRight={3}
              paddingTop={2}
              paddingBottom={2}
            >
              <Typography variant="body-3" color="secondary">
                {`"${data.note}"`}
              </Typography>
            </Box>
          }
        />
      )}
      <EventBodyEntry
        iconComponent={IcoInfo16}
        testID="workflow-triggered-event-body"
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
      />
    </Stack>
  );
};

export default WorkflowTriggeredEventBody;
