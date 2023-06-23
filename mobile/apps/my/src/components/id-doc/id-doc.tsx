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
  if (
    state.matches('frontImage') ||
    state.matches('backImage') ||
    state.matches('selfie')
  ) {
    const { currentSide, collectingDocumentMeta } = state.context;
    const countryName =
      getCountryFromCode(collectingDocumentMeta.countryCode).label ||
      DEFAULT_COUNTRY.label;

    return (
      <DocScan
        key={currentSide}
        authToken={authToken}
        countryCode={collectingDocumentMeta.countryCode}
        countryName={countryName}
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
