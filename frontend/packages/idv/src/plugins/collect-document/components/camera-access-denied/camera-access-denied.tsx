import { IcoCamera40, IcoClose24 } from '@onefootprint/icons';
import { Box, IconButton, Text, media } from '@onefootprint/ui';
import Image from 'next/image';
import { Trans, useTranslation } from 'react-i18next';
import { createGlobalStyle, styled } from 'styled-components';
import type { DeviceInfo } from '../../../../hooks';
import { isAndroid, isChrome, isIOS, isMobileKind, isSafari } from '../../utils/capture';
import IcoArrowCustom from './ico-arrow-custom';

type CameraAccessDeniedProps = {
  device: DeviceInfo;
  onClose: () => void;
};

const gifBaseUrl = 'https://i.onefp.net/i';

const CameraAccessDenied = ({ onClose, device }: CameraAccessDeniedProps) => {
  const { browser, osName, type } = device || {};
  const { t } = useTranslation('idv', { keyPrefix: 'document-flow' });
  const isMobileOrTabletAndroid = isMobileKind(type) && isAndroid(osName);
  const isMobileOrTabletIOS = isMobileKind(type) && isIOS(osName);

  return (
    <>
      <IconButton aria-label="Close" onClick={onClose} testID="camera-access-request-close-button">
        <IcoClose24 />
      </IconButton>
      <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
        {isMobileOrTabletIOS && isSafari(browser) ? (
          <Box display="flex" justifyContent="center" marginBottom={9}>
            <ImageWithRadius
              src={`${gifBaseUrl}/settings-cam-ios-safari.gif`}
              alt="Settings camera for Safari on iOS"
              width="210"
              height="269"
            />
          </Box>
        ) : isMobileOrTabletIOS && isChrome(browser) ? (
          <Box display="flex" justifyContent="center" marginBottom={9}>
            <ImageWithRadius
              src={`${gifBaseUrl}/settings-cam-ios-chrome.gif`}
              alt="Settings camera for Chrome on iOS"
              width="210"
              height="269"
            />
          </Box>
        ) : isMobileOrTabletAndroid && isChrome(browser) ? (
          <Box display="flex" justifyContent="center" marginBottom={9}>
            <ImageWithRadius
              src={`${gifBaseUrl}/settings-cam-android-chrome.gif`}
              alt="Settings camera for Chrome on Android"
              width="210"
              height="233"
            />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" marginBottom={7}>
            <IcoCamera40 />
          </Box>
        )}
        <Text variant="heading-3" textAlign="center" marginBottom={4}>
          {t('access-camera')}
        </Text>
        {isMobileOrTabletIOS && isSafari(browser) ? (
          <>
            <Text tag="span" variant="body-1" textAlign="center">
              {t('go-to-camera-settings')}
            </Text>
            <Text tag="span" variant="label-1" textAlign="center">
              {t('then-refresh-page')}
            </Text>
          </>
        ) : isMobileOrTabletIOS && isChrome(browser) ? (
          <Text tag="span" variant="body-1" textAlign="center">
            {t('go-to-chrome-settings')}
          </Text>
        ) : isMobileOrTabletAndroid && isChrome(browser) ? (
          <Text tag="span" variant="body-1" textAlign="center">
            <Trans ns="idv" i18nKey="document-flow.go-to-chrome-url" components={{ bold: <strong /> }} />
          </Text>
        ) : (
          <Text tag="span" variant="body-1" textAlign="center">
            {t('go-to-device-settings')}
          </Text>
        )}
      </Box>
      {isMobileOrTabletIOS && isSafari(browser) ? (
        <Box marginLeft={7}>
          <IcoArrowCustom />
        </Box>
      ) : null}
      <GlobalFootPrintFooterModification />
    </>
  );
};

const GlobalFootPrintFooterModification = createGlobalStyle`
  ${media.lessThan('md')`
    #footprint-footer { display: none; }
    #idv-body-content-container > div { padding-bottom: 0; }
  `}
`;

const ImageWithRadius = styled(Image)`
  border-radius: 8px; // There is no border-radius 8px in our themes yet
`;

export default CameraAccessDenied;
