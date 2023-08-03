import { FootprintVariant } from '@onefootprint/footprint-js';
import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, IconButton } from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  title?: string;
  variant: FootprintVariant;
  onClose?: () => void;
};

const Header = ({ title, variant, onClose }: HeaderProps) => {
  const { t } = useTranslation('pages.secure-form.form-dialog.header');
  const canClose = (variant === 'modal' || variant === 'drawer') && onClose;

  if (!title && !canClose) {
    return null;
  }

  return (
    <Container data-variant={variant}>
      {canClose && (
        <CloseContainer>
          <IconButton aria-label={t('close-aria-label')} onClick={onClose}>
            <IcoClose24 />
          </IconButton>
        </CloseContainer>
      )}
      {title && <span>{title}</span>}
    </Container>
  );
};

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[6]};
  `}
`;

const Container = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 1;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;
    ${createFontStyles('label-2')}

    &[data-variant='inline'] {
      padding: ${theme.spacing[7]} ${theme.spacing[7]} 0;
      ${createFontStyles('label-1')}
    }

    &[data-variant='modal'],
    &[data-variant='drawer'] {
      justify-content: center;
      padding: ${theme.spacing[4]};
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default Header;
