import { useRequestErrorToast } from '@onefootprint/hooks';
import type { DocumentRequestConfig, WorkflowRequestConfig } from '@onefootprint/types';
import { DocumentRequestKind, TriggerKind } from '@onefootprint/types';
import type { DialogButton } from '@onefootprint/ui';
import { Dialog } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useEntityId from '@/entity/hooks/use-entity-id';

import useCreateTrigger from '../actions/components/hooks/use-create-trigger';
import RequestMoreInfoForm from './components/request-more-info';
import type { TriggerFormData } from './components/request-more-info/types';
import { RequestMoreInfoKind } from './components/request-more-info/types';
import useDisplayLinkDialog from './hooks/use-display-link-dialog';

export type RequestMoreInfoDialogProps = {
  open: boolean;
  onClose: () => void;
};

enum DialogState {
  form = 'form',
  link = 'link',
}

const RequestMoreInfoDialog = ({ open, onClose }: RequestMoreInfoDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.request-more-info',
  });
  const submitTriggerMutation = useCreateTrigger();
  const showRequestErrorToast = useRequestErrorToast();
  const entityId = useEntityId();
  // This dialog has two states: one that collects info on what kind of link to generate,
  // and another that displays the link with an option to send it via SMS
  const [dialogState, setDialogState] = useState<DialogState>(DialogState.form);

  const handleClose = () => {
    setDialogState(DialogState.form);
    onClose();
  };
  const displayLinkDialogProps = useDisplayLinkDialog({
    linkData: submitTriggerMutation.data,
    onClose: handleClose,
  });

  const handleGenerateLink = (data: TriggerFormData) => {
    const { kinds: triggerKinds, collectSelfie, note, playbook, customDocument } = data;
    if (!triggerKinds.length) {
      return;
    }
    let trigger: WorkflowRequestConfig;
    if (triggerKinds.length === 1 && triggerKinds[0] === RequestMoreInfoKind.Onboard && playbook) {
      // For playbooks, there can be only one kind in the list
      trigger = {
        kind: TriggerKind.Onboard,
        data: { playbookId: playbook.value },
      };
    } else {
      const configs: DocumentRequestConfig[] = [];
      triggerKinds.forEach(kind => {
        if (kind === RequestMoreInfoKind.IdDocument) {
          configs.push({
            kind: DocumentRequestKind.Identity,
            data: {
              collectSelfie,
            },
          });
        } else if (kind === RequestMoreInfoKind.ProofOfSsn) {
          configs.push({
            kind: DocumentRequestKind.ProofOfSsn,
            data: {},
          });
        } else if (kind === RequestMoreInfoKind.ProofOfAddress) {
          configs.push({
            kind: DocumentRequestKind.ProofOfAddress,
            data: {},
          });
        } else if (kind === RequestMoreInfoKind.CustomDocument && customDocument) {
          customDocument.forEach(doc => {
            configs.push({
              kind: DocumentRequestKind.Custom,
              data: {
                name: doc.customDocumentName,
                identifier: doc.customDocumentIdentifier,
                description: doc.customDocumentDescription,
              },
            });
          });
        }
      });
      trigger = { kind: TriggerKind.Document, data: { configs } };
    }
    submitTriggerMutation.mutate(
      {
        entityId,
        trigger,
        note: note || undefined,
        sendLink: false,
      },
      {
        onSuccess: () => {
          setDialogState(DialogState.link);
        },
        onError: (error: unknown) => {
          showRequestErrorToast(error);
        },
      },
    );
  };

  let primaryButton: DialogButton;
  let secondaryButton: DialogButton;
  let component: React.ReactNode;

  if (dialogState === DialogState.form) {
    primaryButton = {
      form: 'request-more-info-form',
      label: t('next'),
      loading: submitTriggerMutation.isLoading,
      disabled: submitTriggerMutation.isLoading,
      type: 'submit',
    };
    secondaryButton = {
      label: t('cancel'),
      onClick: handleClose,
      disabled: submitTriggerMutation.isLoading,
    };
    component = <RequestMoreInfoForm formId="request-more-info-form" onSubmit={handleGenerateLink} />;
  } else {
    ({ primaryButton, secondaryButton, component } = displayLinkDialogProps);
  }

  return (
    <Dialog
      size="compact"
      title={t('title')}
      onClose={handleClose}
      open={open}
      primaryButton={primaryButton}
      secondaryButton={secondaryButton}
    >
      {component}
    </Dialog>
  );
};

export default RequestMoreInfoDialog;
