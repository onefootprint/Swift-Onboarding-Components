import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, media, ScrollArea } from '@onefootprint/ui';
import React from 'react';

import CardHeader from './components/card-header';
import ModalHeader from './components/modal-header';
import SecuredByFootprint from './components/secured-by-footprint';

export type FormDialogButton = {
  disabled?: boolean;
  form?: string;
  label: string;
  loading?: boolean;
  onClick?: (dataSubmitted?: any) => void;
  type?: 'button' | 'submit' | 'reset';
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
  const { t } = useTranslation('components.secure-form.form-dialog');

  return (
    <Container data-testid={testID} data-variant={variant}>
      {variant === 'modal' && title && onClose && (
        <ModalHeader onClose={onClose} title={title} />
      )}
      {variant === 'card' && title && <CardHeader title={title} />}
      <div style={{ flexGrow: 1 }}>
        <ScrollArea sx={{ padding: 7 }}>{children}</ScrollArea>
      </div>
      <Footer>
        <SecuredByFootprint />
        <ButtonsContainer>
          {secondaryButton && (
            <Button
              disabled={secondaryButton.disabled}
              form={secondaryButton.form}
              loading={secondaryButton.loading}
              loadingAriaLabel={t('loading-aria-label')}
              onClick={secondaryButton.onClick}
              size="compact"
              type={secondaryButton.type}
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
              loadingAriaLabel={t('loading-aria-label')}
              onClick={primaryButton.onClick}
              size="compact"
              type={primaryButton.type}
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
    width: 100%;

    &[data-variant='modal'] {
      box-shadow: ${theme.elevation[3]};
      border: none;
      height: 100%;
      border-radius: 0;

      ${media.greaterThan('md')`
        height: auto;
        width: 500px;
        max-height: calc(100% - (2 * ${theme.spacing[9]}));
        margin: ${theme.spacing[9]};
        border-radius: ${theme.borderRadius.default};
    `}
    }
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
