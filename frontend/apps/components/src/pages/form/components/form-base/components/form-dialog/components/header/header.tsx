import type { FootprintVariant } from '@onefootprint/footprint-js';
import { IcoClose24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type HeaderProps = {
  title?: string;
  variant: FootprintVariant;
  onClose?: () => void;
};

const Header = ({ title, variant, onClose }: HeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.form-dialog.header',
  });
  const canClose = variant === 'modal' || variant === 'drawer';
  if (!title && !canClose) {
    return null;
  }

  return (
    <>
      {canClose && (
        <CloseContainer>
          <IconButton aria-label={t('close-aria-label')} onClick={onClose} testID="close-button">
            <IcoClose24 />
          </IconButton>
        </CloseContainer>
      )}
      {title && <span data-testid="form-title">{title}</span>}
    </>
  );
};

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[6]};
  `}
`;

export default Header;
