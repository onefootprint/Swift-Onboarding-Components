import { useRequestErrorToast } from '@onefootprint/hooks';
import type { TokenKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useGenerateTokenRequest from './use-generate-token';

type SendLinkMutationProps = {
  entityId: string;
  kind: TokenKind;
  onDone: () => void;
};

const useSendTokenLinkMutation = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.send-link',
  });
  const generateTokenMutation = useGenerateTokenRequest();
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();

  const { isPending } = generateTokenMutation;

  const mutate = ({ entityId, kind, onDone }: SendLinkMutationProps) => {
    generateTokenMutation.mutate(
      {
        entityId,
        kind,
        sendLink: true,
      },
      {
        onSuccess: response => {
          toast.show({
            title: t('header'),
            description: t(`description.${response.deliveryMethod}`),
          });
          onDone();
        },
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          onDone();
        },
      },
    );
  };
  return { mutate, isPending };
};

export default useSendTokenLinkMutation;
