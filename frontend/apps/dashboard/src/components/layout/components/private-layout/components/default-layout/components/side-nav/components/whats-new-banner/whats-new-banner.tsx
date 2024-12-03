import { IcoCloseSmall16 } from '@onefootprint/icons';
import { Box, Button, IconButton, Stack, Text } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type WhatsNewBannerProps = {
  open: boolean;
  onWhatsNewOpen: () => void;
  onDismiss: () => void;
};

const WhatsNewBanner = ({ open, onWhatsNewOpen, onDismiss }: WhatsNewBannerProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.private-layout.nav.whats-new.banner' });

  return (
    <AnimatePresence>
      {open && (
        <Container
          initial={{ opacity: 0, y: -10, left: '50%', transform: 'translateX(-50%)' }}
          animate={{ opacity: 1, y: 0, left: '50%', transform: 'translateX(-50%)' }}
          exit={{ opacity: 0, y: -10, left: '50%', transform: 'translateX(-50%)' }}
          transition={{ duration: 0.2 }}
        >
          <Stack direction="column" gap={2}>
            <Aligner>
              <IconButton aria-label={t('dismiss')} onClick={onDismiss} size="compact">
                <IcoCloseSmall16 color="tertiary" />
              </IconButton>
            </Aligner>
            <Text variant="label-3">{t('title')}</Text>
            <Text variant="body-3" color="secondary">
              {t('subtitle')}
            </Text>
          </Stack>
          <Button variant="secondary" onClick={onWhatsNewOpen}>
            {t('see-updates')}
          </Button>
        </Container>
      )}
    </AnimatePresence>
  );
};

const Container = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    position: absolute;
    bottom: calc(100% + ${theme.spacing[4]});
    width: calc(100% - ${theme.spacing[3]} * 2);
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    padding: ${theme.spacing[5]} ${theme.spacing[5]} ${theme.spacing[4]} ${theme.spacing[5]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    z-index: ${theme.zIndex.sticky};
  `}
`;

const Aligner = styled(Box)`
  ${({ theme }) => css`
    position: absolute;
    right: ${theme.spacing[1]};
    top: ${theme.spacing[1]};
  `}
`;

export default WhatsNewBanner;
