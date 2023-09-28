import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, Dialog, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import QRCode from 'react-qr-code';

type AboutAppClipAndInstantAppProps = {
  kind: 'app-clip' | 'instant-app';
};

const AboutAppClipAndInstantApp = ({
  kind,
}: AboutAppClipAndInstantAppProps) => {
  const { t } = useTranslation(`pages.entity.device-insights.${kind}`);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <LinkButton onClick={() => setIsOpen(true)} size="compact">
        {t('about')}
      </LinkButton>
      <Dialog
        onClose={handleClose}
        open={isOpen}
        size="compact"
        title={t('dialog.title')}
      >
        <Typography variant="body-2">{t('dialog.content')}</Typography>
        <InstructionsContainer>
          <Typography variant="body-2">{t('dialog.demo')}</Typography>
          <Box sx={{ marginY: 5 }}>
            <QRCode
              value="https://handoff.onefootprint.com/appclip?demo=true#1234512345"
              size={128}
            />
          </Box>
          <Typography variant="body-2" color="secondary">
            {t('dialog.instructions')}
          </Typography>
          <Typography
            variant="body-4"
            color="tertiary"
            sx={{ textAlign: 'center' }}
          >
            {t('dialog.disclaimer')}
          </Typography>
        </InstructionsContainer>
      </Dialog>
    </>
  );
};

const InstructionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    margin-top: ${theme.spacing[7]};
    text-align: center;
    align-items: center;
  `}
`;

export default AboutAppClipAndInstantApp;
