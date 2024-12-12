import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import type { Annotation, WorkflowTriggeredEventData } from '@onefootprint/types';
import { RoleScopeKind, TokenKind } from '@onefootprint/types';
import { Dialog, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

import useDisplayLinkDialog from '../../../../../vault/components/vault-actions/components/user-actions/components/request-more-info-dialog/hooks/use-display-link-dialog';
import useGenerateTokenRequest from '../../../../../vault/components/vault-actions/hooks/use-generate-token';
import AnnotationNote from '../annotation-note';
import EventBodyEntry from '../event-body-entry';

type WorkflowTriggeredEventBodyProps = {
  data: WorkflowTriggeredEventData;
  entityId: string;
};

const WorkflowTriggeredEventBody = ({ data, entityId }: WorkflowTriggeredEventBodyProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.workflow-triggered-event',
  });
  const generateTokenMutation = useGenerateTokenRequest();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleClose = () => {
    setIsDialogOpen(false);
  };
  const showErrorToast = useRequestErrorToast();
  // Some very legacy events don't have an fpId
  const userEntityId = data.fpId || entityId;
  const { title, primaryButton, secondaryButton, component } = useDisplayLinkDialog({
    linkData: generateTokenMutation.data,
    onClose: handleClose,
    entityId: userEntityId,
  });

  if (!data.requestIsActive) {
    return null;
  }

  const openLinkDialog = () => {
    setIsDialogOpen(true);
    generateTokenMutation.mutate(
      {
        entityId: userEntityId,
        kind: TokenKind.inherit,
        sendLink: false,
      },
      {
        onError: (error: unknown) => {
          showErrorToast(error);
          setIsDialogOpen(false);
        },
      },
    );
  };

  return (
    <>
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
                {t('link-generated')}
              </Text>
              <Stack align="center" justify="center" marginLeft={1} marginRight={1}>
                ·
              </Stack>
              <PermissionGate
                scopeKind={RoleScopeKind.manualReview}
                fallbackText={t('create-link.no-permission')}
                tooltipPosition="left"
              >
                <LinkButton onClick={openLinkDialog} disabled={generateTokenMutation.isPending} variant="label-3">
                  {t('create-link.label')}
                </LinkButton>
              </PermissionGate>
            </Stack>
          }
        />
      </Stack>
      <Dialog
        size="compact"
        title={title}
        onClose={handleClose}
        open={isDialogOpen}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
      >
        {component}
      </Dialog>
    </>
  );
};

export default WorkflowTriggeredEventBody;
