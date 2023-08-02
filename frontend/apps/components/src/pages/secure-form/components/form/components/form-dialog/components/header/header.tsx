import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { IconButton, Typography } from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  title?: string;
  variant: 'modal' | 'card' | 'drawer';
  onClose?: () => void;
};

const Header = ({ title, variant, onClose }: HeaderProps) => {
  const { t } = useTranslation('pages.secure-form.form-dialog.header');
  const canClose = (variant === 'modal' || variant === 'drawer') && onClose;
  const titleVariant = variant === 'card' ? 'label-1' : 'label-2';
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
      {title && <Typography variant={titleVariant}>{title}</Typography>}
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

    body[data-variant='card'] & {
      padding: ${theme.spacing[7]} ${theme.spacing[7]} 0;
    }

    body[data-variant='modal'],
    body[data-variant='card'] & {
      justify-content: center;
      padding: ${theme.spacing[4]};
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default Header;
