import { Box, Dialog, LinkButton, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import styled, { css } from 'styled-components';

type AboutAppClipAndInstantAppProps = {
  kind: 'app-clip' | 'instant-app';
};

const AboutAppClipAndInstantApp = ({ kind }: AboutAppClipAndInstantAppProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: `pages.entity.device-insights.${kind}`,
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <LinkButton onClick={() => setIsOpen(true)}>{t('about')}</LinkButton>
      <Dialog onClose={handleClose} open={isOpen} size="compact" title={t('dialog.title')}>
        <Text variant="body-2">{t('dialog.content')}</Text>
        <InstructionsContainer>
          <Text variant="body-2">{t('dialog.demo')}</Text>
          <Box marginTop={5} marginBottom={5}>
            <QRCode value="https://handoff.onefootprint.com/appclip?demo=true#1234512345" size={128} />
          </Box>
          <Text variant="body-2" color="secondary">
            {t('dialog.instructions')}
          </Text>
          <Text variant="body-3" color="tertiary" textAlign="center">
            {t('dialog.disclaimer')}
          </Text>
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
