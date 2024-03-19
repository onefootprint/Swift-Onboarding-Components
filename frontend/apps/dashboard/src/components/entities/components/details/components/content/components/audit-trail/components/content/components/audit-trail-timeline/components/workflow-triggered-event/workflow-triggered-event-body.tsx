import { IcoInfo16 } from '@onefootprint/icons';
import type {
  Annotation,
  WorkflowTriggeredEventData,
} from '@onefootprint/types';
import { TokenKind } from '@onefootprint/types';
import { LinkButton, Stack, Text, Tooltip } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useGenerateTokenRequest from '../../../../../../../vault/components/vault-actions/hooks/use-generate-token';
import AnnotationNote from '../annotation-note';
import EventBodyEntry from '../event-body-entry';

type WorkflowTriggeredEventBodyProps = {
  data: WorkflowTriggeredEventData;
  entityId: string;
};

const HIDE_TIMEOUT = 1000;

let confirmationTimeout: null | ReturnType<typeof setTimeout> = null;

const WorkflowTriggeredEventBody = ({
  data,
  entityId,
}: WorkflowTriggeredEventBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.workflow-triggered-event',
  });
  const generateTokenMutation = useGenerateTokenRequest();

  const [confirmationTooltipMessage, setConfirmationTooltipMessage] = useState<
    string | null
  >(null);
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
    generateTokenMutation.mutate(
      {
        entityId,
        kind: TokenKind.inherit,
        sendLink: false,
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
    <Stack direction="column">
      {data.note && (
        <AnnotationNote
          annotation={
            {
              id: '',
              note: data.note,
              isPinned: false,
              source: data.actor,
              timestamp: '',
            } as Annotation
          }
          hidePinToggle
        />
      )}
      <EventBodyEntry
        iconComponent={IcoInfo16}
        testID="workflow-triggered-event-body"
        content={
          <Stack gap={2}>
            <Text variant="body-3" tag="span">
              {t('link-sent')}
            </Text>
            {shouldShowCopyButton && (
              <>
                <Stack
                  align="center"
                  justify="center"
                  marginLeft={1}
                  marginRight={1}
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
                    onClick={generateLinkAndCopyToClipboard}
                    disabled={generateTokenMutation.isLoading}
                    variant="label-4"
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
