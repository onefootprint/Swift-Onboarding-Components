import { Button, Grid, InlineAlert, Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import useTransferMachine from '../../hooks/use-machine';

const ConfirmContinueOnDesktop = () => {
  const [, send] = useTransferMachine();
  const { t } = useTranslation('idv', {
    keyPrefix: 'transfer.pages.confirm-continue-on-desktop',
  });

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
      <Grid.Container gap={7} textAlign="center">
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <InlineAlert variant="warning" textAlign="left">
          {t('warning')}
        </InlineAlert>
        <Stack direction="column" gap={3} width="100%">
          <Button
            fullWidth
            variant="primary"
            onClick={handleMobile}
            size="large"
          >
            {t('cta.mobile')}
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={handleDesktop}
            size="large"
          >
            {t('cta.desktop')}
          </Button>
        </Stack>
      </Grid.Container>
    </>
  );
};

export default ConfirmContinueOnDesktop;
