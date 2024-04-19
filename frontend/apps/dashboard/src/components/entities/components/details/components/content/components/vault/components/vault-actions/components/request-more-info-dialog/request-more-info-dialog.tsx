import { useRequestErrorToast } from '@onefootprint/hooks';
import { TriggerKind } from '@onefootprint/types';
import type { DialogButton } from '@onefootprint/ui';
import { Dialog } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useEntityId from '@/entity/hooks/use-entity-id';

import useCreateTrigger from '../actions/components/hooks/use-create-trigger';
import RequestMoreInfoForm from './components/request-more-info';
import type { TriggerFormData } from './components/request-more-info/request-more-info-form';
import useDisplayLinkDialog from './hooks/use-display-link-dialog';

export type RequestMoreInfoDialogProps = {
  open: boolean;
  onClose: () => void;
};

enum DialogState {
  form = 'form',
  link = 'link',
}

const RequestMoreInfoDialog = ({
  open,
  onClose,
}: RequestMoreInfoDialogProps) => {
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
    const { kind, collectSelfie, note, playbook } = data;
    let trigger;
    if (kind === TriggerKind.IdDocument) {
      trigger = { kind, data: { collectSelfie } };
    } else if (kind === TriggerKind.Onboard && playbook) {
      trigger = { kind, data: { playbookId: playbook.value } };
    } else if (kind === TriggerKind.ProofOfSsn) {
      trigger = { kind };
    } else if (kind === TriggerKind.ProofOfAddress) {
      trigger = { kind };
    } else {
      return;
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
    component = (
      <RequestMoreInfoForm
        formId="request-more-info-form"
        onSubmit={handleGenerateLink}
      />
    );
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
