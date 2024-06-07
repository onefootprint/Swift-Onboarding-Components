import { Button } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { FormDialogButton } from '../../types';
import SecuredByFootprint from './components/secured-by-footprint';

type FooterProps = {
  primaryButton: FormDialogButton;
  secondaryButton?: FormDialogButton;
  hideFootprintLogo?: boolean;
  hideSaveButton?: boolean;
  hideCancelButton?: boolean;
};

const Footer = ({
  primaryButton,
  secondaryButton,
  hideFootprintLogo,
  hideSaveButton,
  hideCancelButton,
}: FooterProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.form-dialog',
  });

  if (hideSaveButton && hideCancelButton) {
    return <Container hideFootprintLogo={hideFootprintLogo}>{!hideFootprintLogo && <SecuredByFootprint />}</Container>;
  }

  return (
    <Container hideFootprintLogo={hideFootprintLogo}>
      {!hideFootprintLogo && <SecuredByFootprint />}
      <ButtonsContainer>
        {!hideCancelButton && secondaryButton && (
          <Button
            disabled={secondaryButton.disabled}
            form={secondaryButton.form}
            loading={secondaryButton.loading}
            loadingAriaLabel={t('loading-aria-label')}
            onClick={secondaryButton.onClick}
            type={secondaryButton.type}
            variant="secondary"
          >
            {secondaryButton.label}
          </Button>
        )}
        {!hideSaveButton && (
          <Button
            testID="primary-button"
            disabled={primaryButton.disabled}
            form={primaryButton.form}
            loading={primaryButton.loading}
            loadingAriaLabel={t('loading-aria-label')}
            onClick={primaryButton.onClick}
            type={primaryButton.type}
            variant="primary"
          >
            {primaryButton.label}
          </Button>
        )}
      </ButtonsContainer>
    </Container>
  );
};

const Container = styled.div<{ hideFootprintLogo?: boolean }>`
  ${({ hideFootprintLogo }) => css`
    display: flex;
    align-items: center;
    justify-content: ${hideFootprintLogo ? 'flex-end' : 'space-between'};
    width: 100%;
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

export default Footer;
