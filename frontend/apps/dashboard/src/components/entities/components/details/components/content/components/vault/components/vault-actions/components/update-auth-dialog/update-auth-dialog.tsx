import { useRequestErrorToast } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { IdDI, TokenKind } from '@onefootprint/types';
import {
  Dialog,
  Shimmer,
  Stack,
  TextInput,
  Typography,
  useToast,
} from '@onefootprint/ui';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useEntity from 'src/components/entities/components/details/hooks/use-entity';

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
  const userHasPhone = useEntity(entityId).data?.attributes?.includes(
    IdDI.phoneNumber,
  );

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
    const shouldGenerateToken =
      open && !generateTokenMutation.isLoading && !generateTokenMutation.data;
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
  }, [
    open,
    generateTokenMutation,
    entityId,
    handleClose,
    showRequestErrorToast,
  ]);

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
        disabled: sendLinkMutation.isLoading || generateTokenMutation.isLoading,
      }}
      secondaryButton={{
        label: userHasPhone ? t('send-link-sms') : t('send-link-email'),
        onClick: handleSendLink,
        disabled: sendLinkMutation.isLoading || generateTokenMutation.isLoading,
        loading: sendLinkMutation.isLoading,
      }}
    >
      <Stack gap={3} direction="column">
        <Typography variant="label-3">{t('header')}</Typography>
        <Typography variant="body-3" color="secondary">
          {t('share-this-link')}
        </Typography>
        <StyledLi>
          <Typography variant="body-3" color="secondary" as="span">
            {t('update-phone')}
          </Typography>
        </StyledLi>
        <StyledLi>
          <Typography variant="body-3" color="secondary" as="span">
            {t('update-email')}
          </Typography>
        </StyledLi>
        {/* TODO show this copy when passkey editing is fixed */}
        {/* <StyledLi>
          <Typography variant="body-3" color="secondary" as="span">
            {t('update-passkey')}
          </Typography>
        </StyledLi> */}
        {generateTokenMutation.isLoading ? (
          <Shimmer sx={{ width: '100%', height: '32px' }} />
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
