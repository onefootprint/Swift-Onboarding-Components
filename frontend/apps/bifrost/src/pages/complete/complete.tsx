import { IcoCheckCircle40 } from '@onefootprint/icons';
import { HeaderTitle, Logger, NavigationHeader, useFootprintProvider } from '@onefootprint/idv';
import checkIsIframe from '@onefootprint/idv/src/utils/check-is-in-iframe';
import checkIsMobile from '@onefootprint/idv/src/utils/check-is-mobile';
import { Box, Button, LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useBifrostMachine } from 'src/components/bifrost-machine-provider';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

const AUTO_CLOSE_DELAY = 6000;

const Complete = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.complete' });
  const fpProvider = useFootprintProvider();
  const [state] = useBifrostMachine();
  const isWebview = !checkIsIframe() && checkIsMobile();
  const { idvCompletePayload } = state.context;

  const handleComplete = (delay?: number) => {
    Logger.info('IDV flow is complete, sending validation token back to the tenant from Bifrost completion page');
    if (idvCompletePayload && idvCompletePayload.validationToken) {
      fpProvider.complete({
        validationToken: idvCompletePayload.validationToken,
        deviceResponse: idvCompletePayload.deviceResponseJson,
        authToken: idvCompletePayload.authToken,
        delay,
      });
    }
  };

  useEffectOnce(() => {
    if (!isWebview) handleComplete(AUTO_CLOSE_DELAY);
  });

  return (
    <Container>
      <NavigationHeader leftButton={isWebview ? undefined : { variant: 'close' }} />
      {!isWebview && <IcoCheckCircle40 color="success" />}
      <Box marginBottom={4} />
      <HeaderTitle
        display="flex"
        flexDirection="column"
        gap={4}
        subtitle={isWebview ? t('subtitle.webview') : t('subtitle.browser')}
        title={isWebview ? t('title.webview') : t('title.browser')}
        zIndex={3}
      />
      <Box />
      <Box marginTop={7} width="100%">
        {isWebview ? (
          <Button fullWidth onClick={() => handleComplete()}>
            {t('cta.webview')}
          </Button>
        ) : (
          <LinkButton onClick={() => handleComplete()}>{t('cta.browser')}</LinkButton>
        )}
      </Box>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  position: relative;
`;

export default Complete;
