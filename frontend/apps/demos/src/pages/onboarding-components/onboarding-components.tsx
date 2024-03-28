import { Provider } from '@onefootprint/components';
import React, { useState } from 'react';

import CollectData from './components/collect-data';
import Identify from './components/identify';
import PasskeysAndDocs from './components/passkey-and-docs';

const Demo = () => {
  const [step, setStep] = useState({
    identification: true,
    data: false,
    passkeysAndDocs: false,
    success: false,
  });

  if (step.identification) {
    return (
      <Identify
        onDone={() => {
          setStep(prev => ({
            ...prev,
            identification: false,
            data: true,
          }));
        }}
      />
    );
  }

  if (step.data) {
    return (
      <CollectData
        onDone={() => {
          setStep(prev => ({
            ...prev,
            data: false,
            passkeysAndDocs: true,
          }));
        }}
      />
    );
  }

  if (step.passkeysAndDocs) {
    return (
      <PasskeysAndDocs
        onDone={() => {
          setStep(prev => ({
            ...prev,
            passkeysAndDocs: false,
            success: true,
          }));
        }}
      />
    );
  }

  return null;
};

const DemoWithProvider = () => (
  <Provider
    publicKey="pb_test_GjMHPDNuDS4QIw7GEdfgl7"
    sandboxId={Math.random().toString(36).substring(7)}
  >
    <Demo />
  </Provider>
);

export default DemoWithProvider;
