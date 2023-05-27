import { IcoClose24 } from '@onefootprint/icons';
import { Button, IconButton, ScrollArea, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SecuredByFootprint from './components/secured-by-footprint';

export type FormDialogButton = {
  disabled?: boolean;
  form?: string;
  label: string;
  loading?: boolean;
  onClick?: (dataSubmitted?: any) => void;
  variant?: 'button' | 'submit' | 'reset';
};

export type AllButtons = {
  primaryButton: FormDialogButton;
  secondaryButton: FormDialogButton;
};

export type OnlyPrimaryButton = {
  primaryButton: FormDialogButton;
  secondaryButton?: never;
};

export type FormDialogProps = {
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
  testID?: string;
  variant?: 'modal' | 'card';
} & (AllButtons | OnlyPrimaryButton);

const FormDialog = ({
  title,
  primaryButton,
  secondaryButton = undefined,
  children,
  testID,
  onClose,
  variant = 'modal',
}: FormDialogProps) => {
  const hasHeader = title || onClose;

  return (
    <Container data-testid={testID} data-variant={variant}>
      {hasHeader && (
        <Header data-variant={variant}>
          {onClose && (
            <CloseContainer>
              <IconButton aria-label="Close" onClick={onClose}>
                <IcoClose24 />
              </IconButton>
            </CloseContainer>
          )}
          {title && <Typography variant="label-2">{title}</Typography>}
        </Header>
      )}
      <ScrollArea sx={{ padding: 7 }}>{children}</ScrollArea>
      <Footer>
        <SecuredByFootprint />
        <ButtonsContainer>
          {secondaryButton && (
            <Button
              disabled={secondaryButton.disabled}
              form={secondaryButton.form}
              loading={secondaryButton.loading}
              loadingAriaLabel="Loading"
              onClick={secondaryButton.onClick}
              size="compact"
              type={secondaryButton.variant}
              variant="secondary"
            >
              {secondaryButton.label}
            </Button>
          )}
          {primaryButton && (
            <Button
              disabled={primaryButton.disabled}
              form={primaryButton.form}
              loading={primaryButton.loading}
              loadingAriaLabel="Loading"
              onClick={primaryButton.onClick}
              size="compact"
              type={primaryButton.variant}
              variant="primary"
            >
              {primaryButton.label}
            </Button>
          )}
        </ButtonsContainer>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    justify-content: stretch;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    &[data-variant='modal'] {
      box-shadow: ${theme.elevation[3]};
      border: none;
    }
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    padding: 0 ${theme.spacing[5]};
    height: 52px;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 1;

    &[data-variant='modal'] {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      justify-content: center;
    }
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[5]};
  `}
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
    background-color: ${theme.backgroundColor.primary};
    width: 100%;
    z-index: 1;
    position: sticky;
    bottom: 0;
    border-radius: 0 0 ${theme.borderRadius.default}
      ${theme.borderRadius.default};
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

export default FormDialog;
