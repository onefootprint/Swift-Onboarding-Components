import { IdDocImageTypes } from '@onefootprint/types';
import { OpenCvProvider } from 'opencv-react-ts';
import React from 'react';

import { useL10nContext } from '../../components/l10n-provider';
import { ImgProcessorsContextProvider } from './components/image-processors';
import { MachineProvider } from './components/machine-provider';
import { MissingPermissionsSheetProvider } from './components/missing-permissions-sheet';
import { FaceModelProvider } from './hooks/use-face-model-loader';
import Router from './pages/router';
import type { IdDocProps } from './types';
import { getCountryCodeFromLocale } from './utils/get-country-from-code';
import getSupportedCountryDocTypes from './utils/get-supported-country-doc-types';
import type { MachineContext } from './utils/state-machine';

const App = ({ context, onDone }: IdDocProps) => {
  const l10n = useL10nContext();
  const { authToken, device, customData } = context;
  if (!customData) {
    return null;
  }

  const { sandboxOutcome } = customData;
  const { shouldCollectSelfie: isSelfieRequired } = customData.requirement;

  const initialContext: MachineContext = {
    authToken,
    device,
    currSide: IdDocImageTypes.front,
    requirement: customData.requirement,
    idDoc: {
      country: getCountryCodeFromLocale(l10n?.locale),
      type: undefined,
    },
    sandboxOutcome,
    supportedCountryAndDocTypes: getSupportedCountryDocTypes({
      ...customData.requirement.supportedCountryAndDocTypes,
    }),
  };

  return (
    <MachineProvider args={initialContext}>
      <MissingPermissionsSheetProvider>
        <FaceModelProvider selfieRequired={isSelfieRequired}>
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

export default App;
