import type { TriggerResponse } from '@onefootprint/types';
import { IdDI, TokenKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useEntity from '@/entity/hooks/use-entity';
import useEntityId from '@/entity/hooks/use-entity-id';

import useSendTokenLinkMutation from '../../../hooks/use-send-token-link';
import LinkDisplay from '../components/link-display';

type UseDisplayLinkDialogProps = {
  linkData?: Omit<TriggerResponse, 'kind'>;
  onClose: () => void;
};

const useDisplayLinkDialog = ({ linkData, onClose }: UseDisplayLinkDialogProps) => {
  const sendLinkMutation = useSendTokenLinkMutation();
  const toast = useToast();
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'actions.request-more-info',
  });
  const entityId = useEntityId();
  const userHasPhone = useEntity(entityId).data?.attributes?.includes(IdDI.phoneNumber);

  const component = <LinkDisplay linkData={linkData} />;

  const handleSendLink = () => {
    sendLinkMutation.mutate({
      entityId,
      kind: TokenKind.inherit,
      onDone: onClose,
    });
  };

  const handleCopyLink = () => {
    const link = linkData?.link || '';
    navigator.clipboard.writeText(link);
    toast.show({
      title: t('link.copied.header'),
      description: t('link.copied.description'),
    });
    onClose();
  };
  const buttonsDisabled = !linkData || sendLinkMutation.isPending;
  const primaryButton = {
    label: t('link.copy-link'),
    disabled: buttonsDisabled,
    onClick: handleCopyLink,
  };
  const secondaryButton = {
    label: userHasPhone ? t('link.send-link-sms') : t('link.send-link-email'),
    onClick: handleSendLink,
    loading: sendLinkMutation.isPending,
    disabled: buttonsDisabled,
  };

  return {
    title: t('title'),
    primaryButton,
    secondaryButton,
    component,
  };
};

export default useDisplayLinkDialog;
