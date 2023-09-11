import type { FootprintVariant } from '@onefootprint/footprint-js';
import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { IconButton } from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  title?: string;
  variant: FootprintVariant;
  onClose?: () => void;
};

const Header = ({ title, variant, onClose }: HeaderProps) => {
  const { t } = useTranslation('pages.secure-form.form-dialog.header');
  const canClose = variant === 'modal' || variant === 'drawer';
  if (!title && !canClose) {
    return null;
  }

  return (
    <>
      {canClose && (
        <CloseContainer>
          <IconButton aria-label={t('close-aria-label')} onClick={onClose}>
            <IcoClose24 />
          </IconButton>
        </CloseContainer>
      )}
      {title && <span>{title}</span>}
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
