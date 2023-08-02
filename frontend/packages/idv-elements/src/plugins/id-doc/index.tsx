import { IdDocImageTypes } from '@onefootprint/types';
import { QueryClientProvider } from '@tanstack/react-query';
import { OpenCvProvider } from 'opencv-react-ts';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { MachineProvider } from './components/machine-provider';
import { MissingPermissionsSheetProvider } from './components/missing-permissions-sheet';
import configureI18next from './config/initializers/i18next';
import queryClient from './config/initializers/react-query';
import { FaceModelProvider } from './hooks/use-face-model-loader';
import Router from './pages/router';
import { IdDocProps } from './types';
import { MachineContext } from './utils/state-machine';

const App = ({ context, onDone }: IdDocProps) => {
  const { authToken, device, customData } = context;
  if (!customData) {
    return null;
  }

  const { shouldCollectSelfie: isSelfieRequired } = customData.requirement;

  const initialContext: MachineContext = {
    authToken,
    device,
    currSide: IdDocImageTypes.front,
    requirement: customData.requirement,
    idDoc: {
      country: customData.requirement.onlyUsSupported ? 'US' : undefined,
      type:
        customData.requirement.supportedDocumentTypes.length === 1
          ? customData.requirement.supportedDocumentTypes[0]
          : undefined,
    },
  };

  return (
    <MachineProvider args={initialContext}>
      <I18nextProvider i18n={configureI18next()}>
        <QueryClientProvider client={queryClient}>
          <MissingPermissionsSheetProvider>
            <FaceModelProvider selfieRequired={isSelfieRequired}>
              <OpenCvProvider>
                <Router onDone={onDone} />
              </OpenCvProvider>
            </FaceModelProvider>
          </MissingPermissionsSheetProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </MachineProvider>
  );
};

export default App;
