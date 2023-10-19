import { IdDocImageTypes } from '@onefootprint/types';
import { QueryClientProvider } from '@tanstack/react-query';
import { OpenCvProvider } from 'opencv-react-ts';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { ImgProcessorsContextProvider } from './components/image-processors';
import { MachineProvider } from './components/machine-provider';
import { MissingPermissionsSheetProvider } from './components/missing-permissions-sheet';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import { FaceModelProvider } from './hooks/use-face-model-loader';
import Router from './pages/router';
import type { IdDocProps } from './types';
import getSupportedCountryDocTypes from './utils/get-supported-country-doc-types';
import type { MachineContext } from './utils/state-machine';

const App = ({ context, onDone }: IdDocProps) => {
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
      country: undefined,
      type: undefined,
    },
    sandboxOutcome,
    supportedCountryAndDocTypes: getSupportedCountryDocTypes({
      ...customData.requirement.supportedCountryAndDocTypes,
    }),
  };

  return (
    <MachineProvider args={initialContext}>
      <I18nextProvider i18n={configureI18next()}>
        <QueryClientProvider client={queryClient}>
          <MissingPermissionsSheetProvider>
            <FaceModelProvider selfieRequired={isSelfieRequired}>
              <OpenCvProvider>
                <ImgProcessorsContextProvider>
                  <Router onDone={onDone} />
                </ImgProcessorsContextProvider>
              </OpenCvProvider>
            </FaceModelProvider>
          </MissingPermissionsSheetProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </MachineProvider>
  );
};

export default App;
