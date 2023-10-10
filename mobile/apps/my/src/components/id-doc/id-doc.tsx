import {
  DEFAULT_COUNTRY,
  getCountryFromCode,
} from '@onefootprint/global-constants';
import { IdDocRequirement } from '@onefootprint/types';
import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';

import { Events, useAnalytics } from '@/utils/analytics';

import DocScan from './screens/doc-scan';
import DocSelection from './screens/doc-selection';
import TooManyAttempts from './screens/too-many-attempts';
import createMachine from './utils/state-machine';

export type IdDocProps = {
  requirement: IdDocRequirement;
  authToken: string;
  onDone: () => void;
};

const IdDoc = ({ authToken, requirement, onDone }: IdDocProps) => {
  const [state, send] = useMachine(() => createMachine(requirement));
  const { currentSide, collectingDocumentMeta } = state.context;
  const analytics = useAnalytics();
  const country = getCountryFromCode(
    collectingDocumentMeta?.countryCode ?? DEFAULT_COUNTRY.value,
  );

  useEffect(() => {
    if (state.done) {
      analytics.track(Events.IdDocCompleted, {
        result: 'success',
      });
      onDone();
    }
  }, [state, onDone]);

  if (state.matches('tooManyAttempts')) {
    return <TooManyAttempts />;
  }

  if (state.matches('docSelection')) {
    return (
      <DocSelection
        requirement={requirement}
        authToken={authToken}
        defaultType={collectingDocumentMeta.type}
        defaultCountry={country}
        onSubmit={(countryCode, documentType, docId) => {
          send('countryAndTypeSubmitted', {
            payload: { countryCode, documentType, docId },
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
        docId={collectingDocumentMeta.docId}
        key={currentSide}
        authToken={authToken}
        country={country}
        requirement={state.context.requirement}
        onDone={nextSideToCollect => {
          send('imageSubmitted', {
            payload: { nextSideToCollect },
          });
        }}
        onBack={() => {
          send('backButtonTapped');
        }}
        onRetryLimitExceeded={() => {
          send('retryLimitExceeded');
        }}
        onConsentCompleted={() => {
          analytics.track(Events.DocConsentAccepted);
          send('consentCompleted');
        }}
        side={currentSide}
        type={collectingDocumentMeta.type}
      />
    );
  }
  return null;
};

export default IdDoc;
