import type { FootprintVariant } from '@onefootprint/footprint-js';
import { ScrollArea } from '@onefootprint/ui';
import React from 'react';

import Container from '../../../container';
import Footer from './components/footer';
import Header from './components/header';
import type { AllButtons, OnlyPrimaryButton } from './types';

export type FormDialogProps = {
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
  testID?: string;
  variant?: FootprintVariant;
  hideFootprintLogo?: boolean;
  hideSaveButton?: boolean;
  hideCancelButton?: boolean;
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
  hideSaveButton,
  hideCancelButton,
}: FormDialogProps) => {
  const shouldHideFooter = hideSaveButton && hideCancelButton && hideFootprintLogo;
  const showHeader = variant === 'modal' || variant === 'drawer' || title;

  return (
    <Container
      testID={testID}
      data-variant={variant}
      header={showHeader && <Header variant={variant} onClose={onClose} title={title} />}
      footer={
        !shouldHideFooter && (
          <Footer
            primaryButton={primaryButton}
            secondaryButton={secondaryButton}
            hideFootprintLogo={hideFootprintLogo}
            hideSaveButton={hideSaveButton}
            hideCancelButton={hideCancelButton}
          />
        )
      }
    >
      <ScrollArea>{children}</ScrollArea>
    </Container>
  );
};

export default FormDialog;
