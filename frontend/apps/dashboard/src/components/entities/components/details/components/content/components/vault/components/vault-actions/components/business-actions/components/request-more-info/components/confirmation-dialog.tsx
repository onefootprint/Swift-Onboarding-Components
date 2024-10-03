import { TokenKind, type TriggerResponse } from '@onefootprint/types';
import { Dialog, useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useGenerateTokenRequest from 'src/hooks/use-generate-token';
import Confirmation from './confirmation';

export type ConfirmationDialogProps = {
  bo: {
    id: string;
    hasPhone: boolean;
  };
  action: TriggerResponse;
  open: boolean;
  onClose: () => void;
};

const ConfirmationDialog = ({ action, bo, open, onClose }: ConfirmationDialogProps) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'request-more-info' });
  const generateTokenMutation = useGenerateTokenRequest();
  const toast = useToast();

  const handleCopyLink = () => {
    const { link } = action || {};
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.show({
      title: t('confirmation.copied.header'),
      description: t('confirmation.copied.description'),
    });
  };

  const handleSendViaSms = () => {
    generateTokenMutation.mutate(
      {
        entityId: bo.id,
        kind: TokenKind.inherit,
        sendLink: true,
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('confirmation.sent.header'),
            description: t('confirmation.sent.description'),
          });
        },
      },
    );
  };

  return (
    <Dialog
      size="compact"
      open={open}
      onClose={onClose}
      title={t('confirmation.title')}
      primaryButton={{
        label: t('confirmation.copy-link'),
        onClick: handleCopyLink,
        disabled: generateTokenMutation.isPending,
      }}
      secondaryButton={{
        label: bo.hasPhone ? t('confirmation.send-via-sms') : t('confirmation.send-via-email'),
        onClick: handleSendViaSms,
        loading: generateTokenMutation.isPending,
        disabled: generateTokenMutation.isSuccess,
      }}
    >
      {action && <Confirmation link={action.link} expiresAt={action.expiresAt} />}
    </Dialog>
  );
};

export default ConfirmationDialog;
