import type { OnboardingConfig } from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types';
import { Box, Button, Dialog, Text, TextInput } from '@onefootprint/ui';
import type React from 'react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import getPermanentLink from '../../utils/get-permanent-link';

export type CopyLinkHandler = {
  launch: () => void;
};

export type CopyLinkProps = {
  playbook: OnboardingConfig;
};

const CopyLink = forwardRef<CopyLinkHandler, CopyLinkProps>(({ playbook }, ref) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.table.actions.copy-link',
  });
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const permanentLink = getPermanentLink(playbook);

  useImperativeHandle(
    ref,
    () => ({
      launch: () => setOpen(true),
    }),
    [],
  );

  const getDescription = (kind: OnboardingConfigKind) => {
    if (kind === OnboardingConfigKind.auth) {
      return t('description.auth');
    }
    if (kind === OnboardingConfigKind.kyb) {
      return t('description.kyb');
    }
    return t('description.kyc');
  };

  const handleCopyToClipboard = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    navigator.clipboard.writeText(permanentLink);
    setShowSuccess(true);
    scheduleToHideConfirmation();
  };

  const scheduleToHideConfirmation = () => {
    setTimeout(() => {
      setShowSuccess(false);
    }, 600);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog onClose={handleClose} open={open} size="compact" title={t('title')}>
      <Content>
        <Text variant="body-3">{getDescription(playbook.kind)}</Text>
        <InputContainer>
          <TextInput value={permanentLink} placeholder={permanentLink} size="compact" disabled />
          <Button variant="primary" onClick={handleCopyToClipboard}>
            <Box minWidth="62px">{showSuccess ? t('copied') : t('copy-link')}</Box>
          </Button>
        </InputContainer>
      </Content>
    </Dialog>
  );
});

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const InputContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    width: 100%;

    & > :first-child {
      flex-grow: 1;
    }
  `}
`;

export default CopyLink;
