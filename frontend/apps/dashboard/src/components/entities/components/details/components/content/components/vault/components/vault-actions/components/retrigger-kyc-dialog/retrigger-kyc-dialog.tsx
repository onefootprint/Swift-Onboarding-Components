import { useRequestErrorToast } from '@onefootprint/hooks';
import { IdDI, TokenKind, TriggerKind } from '@onefootprint/types';
import type { DialogButton } from '@onefootprint/ui';
import { Dialog, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useEntity from 'src/components/entities/components/details/hooks/use-entity';

import useEntityId from '@/entity/hooks/use-entity-id';

import useSendTokenLinkMutation from '../../hooks/use-send-token-link';
import useRetriggerKYC from '../actions/components/hooks/use-retrigger-kyc';
import LinkDisplay from './components/link-display/link-display';
import RetriggerKYCForm from './components/retrigger-kyc-form';
import type { TriggerFormData } from './components/retrigger-kyc-form/retrigger-kyc-form';

export type RetriggerKYCDialogProps = {
  open: boolean;
  onClose: () => void;
};

enum DialogState {
  form = 'form',
  link = 'link',
}

const RetriggerKYCDialog = ({ open, onClose }: RetriggerKYCDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.retrigger-kyc',
  });
  const submitRetriggerKYCMutation = useRetriggerKYC();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const entityId = useEntityId();
  const userHasPhone = useEntity(entityId).data?.attributes?.includes(
    IdDI.phoneNumber,
  );
  const sendLinkMutation = useSendTokenLinkMutation();
  // This dialog has two states: one that collects info on what kind of link to generate,
  // and another that displays the link with an option to send it via SMS
  const [dialogState, setDialogState] = useState<DialogState>(DialogState.form);

  const handleClose = () => {
    setDialogState(DialogState.form);
    onClose();
  };

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
    submitRetriggerKYCMutation.mutate(
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
  if (dialogState === DialogState.form) {
    primaryButton = {
      form: 'retrigger-kyc-form',
      label: t('next'),
      loading: submitRetriggerKYCMutation.isLoading,
      disabled: submitRetriggerKYCMutation.isLoading,
      type: 'submit',
    };
    secondaryButton = {
      label: t('cancel'),
      onClick: handleClose,
      disabled: submitRetriggerKYCMutation.isLoading,
    };
  } else {
    const handleSendLink = () => {
      sendLinkMutation.mutate({
        entityId,
        kind: TokenKind.inherit,
        onDone: handleClose,
      });
    };
    const handleCopyLink = () => {
      const link = submitRetriggerKYCMutation.data?.link || '';
      navigator.clipboard.writeText(link);
      toast.show({
        title: t('link.copied.header'),
        description: t('link.copied.description'),
      });
      handleClose();
    };
    primaryButton = {
      label: t('link.copy-link'),
      disabled: sendLinkMutation.isLoading,
      onClick: handleCopyLink,
    };
    secondaryButton = {
      label: userHasPhone ? t('link.send-link-sms') : t('link.send-link-email'),
      onClick: handleSendLink,
      loading: sendLinkMutation.isLoading,
      disabled: sendLinkMutation.isLoading,
    };
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
      {dialogState === DialogState.form ? (
        <RetriggerKYCForm
          formId="retrigger-kyc-form"
          onSubmit={handleGenerateLink}
        />
      ) : (
        submitRetriggerKYCMutation.data && (
          <LinkDisplay linkData={submitRetriggerKYCMutation.data || ''} />
        )
      )}
    </Dialog>
  );
};

export default RetriggerKYCDialog;
