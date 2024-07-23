import { IdDocImageTypes } from '@onefootprint/types';
import { OpenCvProvider } from 'opencv-react-ts';
import React from 'react';

import { useL10nContext } from '../../../components/l10n-provider';
import { ImgProcessorsContextProvider } from '../components/image-processors';
import { MissingPermissionsSheetProvider } from '../components/missing-permissions-sheet';
import { FaceModelProvider } from '../hooks/use-face-model-loader';
import { getCountryCodeFromLocale } from '../utils/get-country-from-code';
import { MachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { IdDocProps } from './types';
import type { MachineContext } from './utils/state-machine';

const IdDoc = ({ initialContext, onDone }: IdDocProps) => {
  const l10n = useL10nContext();
  const { authToken, config, device, documentRequestId, orgId, sandboxOutcome, uploadMode } = initialContext;
  const { shouldCollectConsent, shouldCollectSelfie, supportedCountryAndDocTypes } = config;

  const context: MachineContext = {
    authToken,
    device,
    orgId,
    documentRequestId,
    shouldCollectSelfie,
    isConsentMissing: shouldCollectConsent,
    uploadMode,
    currSide: IdDocImageTypes.front,
    idDoc: {
      country: getCountryCodeFromLocale(l10n?.locale),
      type: undefined,
    },
    sandboxOutcome,
    supportedCountryAndDocTypes: {
      ...supportedCountryAndDocTypes,
    },
    cameraPermissionState: device.initialCameraPermissionState || 'prompt',
  };

  return (
    <MachineProvider args={context}>
      <MissingPermissionsSheetProvider device={device}>
        <FaceModelProvider isSelfieRequired={shouldCollectSelfie}>
          <OpenCvProvider>
            <ImgProcessorsContextProvider>
              <Router onDone={onDone} />
            </ImgProcessorsContextProvider>
          </OpenCvProvider>
        </FaceModelProvider>
      </MissingPermissionsSheetProvider>
    </MachineProvider>
  );
};

export default IdDoc;
