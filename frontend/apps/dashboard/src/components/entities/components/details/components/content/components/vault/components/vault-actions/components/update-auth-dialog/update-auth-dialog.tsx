import { useRequestErrorToast } from '@onefootprint/hooks';
import { IdDI, TokenKind } from '@onefootprint/types';
import { Dialog, Shimmer, Stack, Text, TextInput, useToast } from '@onefootprint/ui';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useEntity from 'src/components/entities/components/details/hooks/use-entity';
import styled from 'styled-components';

import useEntityId from '@/entity/hooks/use-entity-id';

import useGenerateTokenRequest from '../../hooks/use-generate-token';
import useSendTokenLinkMutation from '../../hooks/use-send-token-link';

export type UpdateAuthDialogProps = {
  open: boolean;
  onClose: () => void;
};

const UpdateAuthDialog = ({ open, onClose }: UpdateAuthDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.update-auth-methods',
  });
  const generateTokenMutation = useGenerateTokenRequest();
  const sendLinkMutation = useSendTokenLinkMutation();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const entityId = useEntityId();
  const userHasPhone = useEntity(entityId).data?.attributes?.includes(IdDI.phoneNumber);

  const handleClose = useCallback(() => {
    generateTokenMutation.reset();
    onClose();
  }, [generateTokenMutation, onClose]);

  const handleSendLink = () => {
    sendLinkMutation.mutate({
      entityId,
      kind: TokenKind.updateAuthMethods,
      onDone: handleClose,
    });
  };

  useEffect(() => {
    const shouldGenerateToken = open && !generateTokenMutation.isPending && !generateTokenMutation.data;
    if (!shouldGenerateToken) {
      return;
    }
    generateTokenMutation.mutate(
      {
        entityId,
        kind: TokenKind.updateAuthMethods,
        sendLink: false,
      },
      {
        onError: (error: unknown) => {
          showRequestErrorToast(error);
          handleClose();
        },
      },
    );
  }, [open, generateTokenMutation, entityId, handleClose, showRequestErrorToast]);

  const handleCopyLink = () => {
    if (!generateTokenMutation.data?.link) {
      return;
    }

    navigator.clipboard.writeText(generateTokenMutation.data.link);
    toast.show({
      title: t('copied.header'),
      description: t('copied.description'),
    });
    handleClose();
  };

  return (
    <Dialog
      size="compact"
      title={t('title')}
      onClose={handleClose}
      open={open}
      primaryButton={{
        label: t('copy-link'),
        onClick: handleCopyLink,
        disabled: sendLinkMutation.isPending || generateTokenMutation.isPending,
      }}
      secondaryButton={{
        label: userHasPhone ? t('send-link-sms') : t('send-link-email'),
        onClick: handleSendLink,
        disabled: sendLinkMutation.isPending || generateTokenMutation.isPending,
        loading: sendLinkMutation.isPending,
      }}
    >
      <Stack gap={3} direction="column">
        <Text variant="label-3">{t('header')}</Text>
        <Text variant="body-3" color="secondary">
          {t('share-this-link')}
        </Text>
        <StyledLi>
          <Text variant="body-3" color="secondary" tag="span">
            {t('update-phone')}
          </Text>
        </StyledLi>
        <StyledLi>
          <Text variant="body-3" color="secondary" tag="span">
            {t('update-email')}
          </Text>
        </StyledLi>
        {/* TODO show this copy when passkey editing is fixed */}
        {/* <StyledLi>
          <Text variant="body-3" color="secondary" tag="span">
            {t('update-passkey')}
          </Text>
        </StyledLi> */}
        {generateTokenMutation.isPending ? (
          <Shimmer height="32px" width="100%" />
        ) : (
          <TextInput
            placeholder="https://auth.onefootprint.com#tok_okj3nppo1zyj6d7uJ9l49iLxY1uc2N4riz"
            value={generateTokenMutation.data?.link}
            size="compact"
            disabled
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          />
        )}
      </Stack>
    </Dialog>
  );
};

const StyledLi = styled.li`
  padding-inline-start: 1ch;
`;

export default UpdateAuthDialog;
