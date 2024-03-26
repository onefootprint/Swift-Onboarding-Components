import { Provider } from '@onefootprint/components';
import React, { useState } from 'react';

import CollectData from './components/collect-data';
import Identify from './components/identify';
import Otp from './components/otp';
import PasskeysAndDocs from './components/passkeys-and-docs';

const Demo = () => {
  const [step, setStep] = useState({
    identification: true,
    otp: false,
    data: false,
    passkeysAndDocs: false,
    process: false,
    success: false,
  });

  if (step.identification) {
    return (
      <Identify
        onDone={() => {
          setStep(prev => ({
            ...prev,
            identification: false,
            otp: true,
          }));
        }}
      />
    );
  }

  if (step.otp) {
    return (
      <Otp
        onDone={() => {
          console.log('done!');
          setStep(prev => ({
            ...prev,
            otp: false,
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
    return <PasskeysAndDocs onDone={() => {}} />;
  }

  return null;
};

const DemoWithProvider = () => (
  <Provider
    publicKey="pb_test_cE5s4US9KsFYVveetNnVFy"
    sandboxId={Math.random().toString(36).substring(7)}
  >
    <Demo />
  </Provider>
);

export default DemoWithProvider;
