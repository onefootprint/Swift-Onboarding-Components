import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React from 'react';

import type { FormDialogButton } from '../../types';
import SecuredByFootprint from './components/secured-by-footprint';

type FooterProps = {
  primaryButton: FormDialogButton;
  secondaryButton?: FormDialogButton;
  hideFootprintLogo?: boolean;
  hideButtons?: boolean;
};

const Footer = ({
  primaryButton,
  secondaryButton,
  hideFootprintLogo,
  hideButtons,
}: FooterProps) => {
  const { t } = useTranslation('pages.secure-form.form-dialog');

  return (
    <Container hideFootprintLogo={hideFootprintLogo}>
      {!hideFootprintLogo && <SecuredByFootprint />}
      {!hideButtons && (
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
      )}
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
