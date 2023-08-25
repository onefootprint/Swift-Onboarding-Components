import themes from '@onefootprint/design-tokens';
import {
  OnboardingRequirementKind,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { DesignSystemProvider } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';

import IdDoc from '@/components/id-doc';
import { PREVIEW_AUTH_TOKEN } from '@/config/constants';

import Banner from './components/banner';
import Completed from './screens/completed';
import Passkey from './screens/passkey';

type PreviewProps = {
  isDemo: boolean;
};

const Preview = ({ isDemo }: PreviewProps) => {
  const [showPasskey, setShowPasskey] = useState(true);
  const [showIdDoc, setShowIdDoc] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <DesignSystemProvider theme={themes.light}>
      {showPasskey && (
        <>
          {isDemo && <Banner />}
          <Passkey
            onContinue={() => {
              setShowPasskey(false);
              setShowIdDoc(true);
            }}
          />
        </>
      )}
      {showIdDoc && (
        <IdDoc
          authToken={PREVIEW_AUTH_TOKEN}
          requirement={{
            isMet: false,
            kind: OnboardingRequirementKind.idDoc,
            shouldCollectSelfie: true,
            shouldCollectConsent: false,
            onlyUsSupported: false,
            supportedDocumentTypes: [
              SupportedIdDocTypes.driversLicense,
              SupportedIdDocTypes.idCard,
              SupportedIdDocTypes.passport,
              SupportedIdDocTypes.residenceDocument,
              SupportedIdDocTypes.visa,
              SupportedIdDocTypes.workPermit,
            ],
          }}
          onDone={() => {
            setShowIdDoc(false);
            setShowComplete(true);
          }}
        />
      )}
      {showComplete && (
        <Completed
          onDone={() => {
            setShowComplete(false);
            setShowPasskey(true);
          }}
        />
      )}
    </DesignSystemProvider>
  );
};

export default Preview;
