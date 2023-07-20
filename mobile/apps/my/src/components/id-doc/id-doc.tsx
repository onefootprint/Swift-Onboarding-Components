import {
  DEFAULT_COUNTRY,
  getCountryFromCode,
} from '@onefootprint/global-constants';
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
  const { currentSide, collectingDocumentMeta } = state.context;
  const country = getCountryFromCode(
    collectingDocumentMeta?.countryCode ?? DEFAULT_COUNTRY.value,
  );

  useEffect(() => {
    if (state.done) {
      onDone();
    }
  }, [state, onDone]);

  if (state.matches('docSelection')) {
    return (
      <DocSelection
        requirement={requirement}
        defaultType={collectingDocumentMeta.type}
        defaultCountry={country}
        onSubmit={(countryCode, documentType) => {
          send('countryAndTypeSubmitted', {
            payload: { countryCode, documentType },
          });
        }}
      />
    );
  }
  if (
    state.matches('frontImage') ||
    state.matches('backImage') ||
    state.matches('selfie')
  ) {
    return (
      <DocScan
        key={currentSide}
        authToken={authToken}
        country={country}
        onDone={nextSideToCollect => {
          send('imageSubmitted', {
            payload: { nextSideToCollect },
          });
        }}
        side={currentSide}
        type={collectingDocumentMeta.type}
      />
    );
  }
  return null;
};

export default IdDoc;
