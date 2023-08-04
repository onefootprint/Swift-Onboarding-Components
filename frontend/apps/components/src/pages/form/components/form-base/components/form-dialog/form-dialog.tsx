import { FootprintVariant } from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import { media, ScrollArea } from '@onefootprint/ui';
import React from 'react';

import Footer from './components/footer';
import Header from './components/header';
import { AllButtons, OnlyPrimaryButton } from './types';

export type FormDialogProps = {
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
  testID?: string;
  variant?: FootprintVariant;
  hideFootprintLogo?: boolean;
  hideButtons?: boolean;
} & (AllButtons | OnlyPrimaryButton);

const FormDialog = ({
  title,
  primaryButton,
  secondaryButton = undefined,
  children,
  testID,
  onClose,
  variant = 'modal',
  hideFootprintLogo,
  hideButtons,
}: FormDialogProps) => {
  const shouldHideFooter = hideButtons && hideFootprintLogo;

  return (
    <Container
      id="footprint-container"
      data-testid={testID}
      data-variant={variant}
    >
      <Header variant={variant} onClose={onClose} title={title} />
      <div style={{ flexGrow: 1 }}>
        <ScrollArea sx={{ padding: 7 }}>{children}</ScrollArea>
      </div>
      {!shouldHideFooter && (
        <Footer
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
          hideFootprintLogo={hideFootprintLogo}
          hideButtons={hideButtons}
        />
      )}
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
    max-height: 100%;
    overflow: auto;

    body[data-variant='modal'] & {
      box-shadow: ${theme.elevation[3]};
      border: none;
      height: 100%;
      width: 100%;
      border-radius: 0;
      margin: 0;

      ${media.greaterThan('md')`
        height: auto;
        max-width: calc(100% - (2 * ${theme.spacing[9]}));
        max-height: calc(100% - (2 * ${theme.spacing[9]}));
        margin: ${theme.spacing[9]};
        border-radius: ${theme.borderRadius.default};
        max-width: 480px;
    `}
    }

    body[data-variant='drawer'] & {
      box-shadow: ${theme.elevation[3]};
      border: none;
      border-radius: 0;
      height: 100vh;
      width: 100%;
      position: fixed;
      right: 0;

      ${media.greaterThan('md')`
        width: 480px;
        border-radius: 0;
    `}
    }
  `}
`;

export default FormDialog;
