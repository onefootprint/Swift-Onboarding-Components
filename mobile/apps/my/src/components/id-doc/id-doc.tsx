import { IdDocRequirement } from '@onefootprint/types';
import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';

import DocScan from './screens/doc-scan';
import DocSelection from './screens/doc-selection';
import createMachine from './utils/state-machine';

export type IdDocProps = {
  requirement: IdDocRequirement;
  authToken: string;
  onDone: () => void;
};

const IdDoc = ({ authToken, requirement, onDone }: IdDocProps) => {
  const [state, send] = useMachine(() => createMachine({ requirement }));

  useEffect(() => {
    if (state.done) {
      onDone();
    }
  }, [state, onDone]);

  if (state.matches('docSelection')) {
    return (
      <DocSelection
        onSubmit={(countryCode, documentType) => {
          send('countryAndTypeSubmitted', {
            payload: { countryCode, documentType },
          });
        }}
      />
    );
  }
  if (state.matches('frontImage')) {
    const { currentStep, collectingDocumentMeta } = state.context;
    return (
      <DocScan
        authToken={authToken}
        countryCode={collectingDocumentMeta.countryCode}
        onDone={() => {
          alert('image done');
        }}
        side={currentStep.side}
        type={collectingDocumentMeta.type}
      />
    );
  }
  return null;
};

export default IdDoc;
