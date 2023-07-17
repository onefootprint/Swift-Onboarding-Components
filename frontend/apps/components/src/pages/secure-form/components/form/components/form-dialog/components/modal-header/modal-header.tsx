import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { IconButton, Typography } from '@onefootprint/ui';
import React from 'react';

type ModalHeaderProps = {
  title: string;
  onClose: () => void;
};

const ModalHeader = ({ title, onClose }: ModalHeaderProps) => {
  const { t } = useTranslation('pages.secure-form.form-dialog.modal-header');

  return (
    <Header>
      <CloseContainer>
        <IconButton aria-label={t('close-aria-label')} onClick={onClose}>
          <IcoClose24 />
        </IconButton>
      </CloseContainer>
      {title && <Typography variant="label-2">{title}</Typography>}
    </Header>
  );
};

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[6]};
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 1;
    padding: ${theme.spacing[4]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;
  `}
`;

export default ModalHeader;
