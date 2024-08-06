import { Dialog, Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type HelpDialogProps = {
  open: boolean;
  onClose: () => void;
};

const HelpDialog = ({ open, onClose }: HelpDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.support-links.dialog',
  });
  return (
    <Dialog title={t('title')} open={open} onClose={onClose} size="compact">
      <Stack direction="column" gap={4}>
        <Text variant="body-3">{t('body')}</Text>
        <ImageContainer>
          <StyledImage alt={t('img-alt')} src="/settings/support-links.png" width={548} height={244} />
        </ImageContainer>
      </Stack>
    </Dialog>
  );
};

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const ImageContainer = styled(Stack)`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    max-width: 548px;
    max-height: 244px;
    overflow: hidden;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

export default HelpDialog;
