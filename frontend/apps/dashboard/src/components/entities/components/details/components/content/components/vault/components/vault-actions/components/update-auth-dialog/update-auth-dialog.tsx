import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoCopy16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import { TokenKind } from '@onefootprint/types/src/api/create-token';
import {
  Dialog,
  IconButton,
  Shimmer,
  Stack,
  TextInput,
  Typography,
  useToast,
} from '@onefootprint/ui';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import useEntityId from '@/entity/hooks/use-entity-id';

import useGenerateTokenRequest from './hooks/use-generate-token';

export type UpdateAuthDialogProps = {
  open: boolean;
  onClose: () => void;
};

const UpdateAuthDialog = ({ open, onClose }: UpdateAuthDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.update-auth-methods',
  });
  const generateTokenMutation = useGenerateTokenRequest();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const entityId = useEntityId();

  const handleClose = useCallback(() => {
    generateTokenMutation.reset();
    onClose();
  }, [generateTokenMutation, onClose]);

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
      variant: 'default',
    });
  };

  return (
    <Dialog
      size="compact"
      title={t('title')}
      onClose={handleClose}
      open={open}
      primaryButton={{
        label: t('done'),
        onClick: handleClose,
      }}
      /*
      TODO add the ability to send via SMS, IF AND ONLY IF the entity has a phone number
      secondaryButton={{
        label: t('send-via-sms'),
      }}
      */
    >
      <Stack gap={3} direction="column">
        <Typography variant="label-3">{t('header')}</Typography>
        <Typography variant="body-3">{t('share-this-link')}</Typography>
        <StyledLi>
          <Typography variant="body-3" as="span">
            {t('update-phone')}
          </Typography>
        </StyledLi>
        <StyledLi>
          <Typography variant="body-3" as="span">
            {t('update-email')}
          </Typography>
        </StyledLi>
        {/* TODO show this copy when passkey editing is fixed */}
        {/* <StyledLi>
          <Typography variant="body-3" as="span">
            {t('update-passkey')}
          </Typography>
        </StyledLi> */}
        <LinkContainer direction="row" gap={3} marginTop={2}>
          {generateTokenMutation.isLoading ? (
            <Shimmer sx={{ width: '100%' }} />
          ) : (
            <TextInput
              placeholder="https://auth.onefootprint.com#tok_okj3nppo1zyj6d7uJ9l49iLxY1uc2N4riz"
              value={generateTokenMutation.data?.link}
              size="compact"
              disabled
            />
          )}
          <IconButton
            disabled={generateTokenMutation.isLoading}
            onClick={handleCopyLink}
            aria-label="copy"
          >
            <IcoCopy16 />
          </IconButton>
        </LinkContainer>
      </Stack>
    </Dialog>
  );
};

const StyledLi = styled.li`
  padding-inline-start: 1ch;
`;

const LinkContainer = styled(Stack)`
  > .fp-input-container {
    width: 100%;
  }
`;

export default UpdateAuthDialog;
