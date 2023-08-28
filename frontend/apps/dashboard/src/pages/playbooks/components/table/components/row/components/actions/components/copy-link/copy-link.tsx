import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { OnboardingConfig } from '@onefootprint/types';
import { Box, Button, Dialog, TextInput, Typography } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

import isKybPlaybook from '../../../../utils/is-kyb-playbook';
import getPermanentLink from '../../utils/get-permanent-link';

export type CopyLinkHandler = {
  launch: () => void;
};

export type CopyLinkProps = {
  playbook: OnboardingConfig;
};

const CopyLink = forwardRef<CopyLinkHandler, CopyLinkProps>(
  ({ playbook }, ref) => {
    const [open, setOpen] = useState(false);
    const permanentLink = getPermanentLink(playbook);
    const [showSuccess, setShowSuccess] = useState(false);

    const type = isKybPlaybook(playbook) ? 'kyb' : 'kyc';
    const { t } = useTranslation('pages.playbooks.table.actions.copy-link');
    useImperativeHandle(
      ref,
      () => ({
        launch: () => setOpen(true),
      }),
      [],
    );

    const handleCopyToClipboard = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
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

    const copyButtonLabel = showSuccess ? t('copied') : t('copy-link');

    return (
      <Dialog
        size="compact"
        title={t(`${type}.title`)}
        open={open}
        onClose={handleClose}
      >
        <Content>
          <Typography variant="body-2">{t(`${type}.description`)}</Typography>
          <InputContainer>
            <TextInput
              autoFocus
              value={permanentLink}
              placeholder={permanentLink}
              size="compact"
            />

            <Button
              variant="primary"
              onClick={handleCopyToClipboard}
              size="small"
            >
              <Box
                sx={{
                  minWidth: '62px',
                }}
              >
                {copyButtonLabel}
              </Box>
            </Button>
          </InputContainer>
        </Content>
      </Dialog>
    );
  },
);

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
