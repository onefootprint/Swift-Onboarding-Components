import { FootprintVariant } from '@onefootprint/footprint-js';
import { Box, ScrollArea } from '@onefootprint/ui';
import React from 'react';

import Container from '../../../container';
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
  const showHeader = variant === 'modal' || variant === 'drawer' || title;

  return (
    <Container
      testID={testID}
      header={
        showHeader && (
          <Header variant={variant} onClose={onClose} title={title} />
        )
      }
      footer={
        !shouldHideFooter && (
          <Footer
            primaryButton={primaryButton}
            secondaryButton={secondaryButton}
            hideFootprintLogo={hideFootprintLogo}
            hideButtons={hideButtons}
          />
        )
      }
    >
      <Box sx={{ flexGrow: 1 }}>
        <ScrollArea>{children}</ScrollArea>
      </Box>
    </Container>
  );
};

export default FormDialog;
