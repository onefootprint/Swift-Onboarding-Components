import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, InlineAlert } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import useDesktopMachine from '../../../hooks/desktop/use-desktop-machine';

const ConfirmContinueOnDesktop = () => {
  const [, send] = useDesktopMachine();
  const { t } = useTranslation('pages.desktop.confirm-continue-on-desktop');

  const handleDesktop = () => {
    send({
      type: 'continueOnDesktop',
    });
  };

  const handleMobile = () => {
    send({
      type: 'continueOnMobile',
    });
  };

  return (
    <>
      <NavigationHeader
        leftButton={{ variant: 'back', onBack: handleMobile }}
      />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <InlineAlert variant="warning" sx={{ textAlign: 'left' }}>
          {t('warning')}
        </InlineAlert>
        <ButtonsContainer>
          <Button fullWidth variant="primary" onClick={handleMobile}>
            {t('cta.mobile')}
          </Button>
          <Button fullWidth variant="secondary" onClick={handleDesktop}>
            {t('cta.desktop')}
          </Button>
        </ButtonsContainer>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
    text-align: center;
  `}
`;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    width: 100%;
  `}
`;

export default ConfirmContinueOnDesktop;
