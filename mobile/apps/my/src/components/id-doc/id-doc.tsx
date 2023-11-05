import {
  DEFAULT_COUNTRY,
  getCountryFromCode,
} from '@onefootprint/global-constants';
import type { IdDocRequirement } from '@onefootprint/types';
import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';

import { Events, useAnalytics } from '@/utils/analytics';

import DocScan from './screens/doc-scan';
import DocSelection from './screens/doc-selection';
import createMachine from './utils/state-machine';

export type IdDocProps = {
  requirement: IdDocRequirement;
  authToken: string;
  onDone: () => void;
};

const IdDoc = ({ authToken, requirement, onDone }: IdDocProps) => {
  const [state, send] = useMachine(() => createMachine(requirement));
  const { currentSide, collectingDocumentMeta } = state.context;
  const { shouldCollectConsent, supportedCountryAndDocTypes } =
    state.context.requirement;

  const analytics = useAnalytics();
  const country = getCountryFromCode(
    collectingDocumentMeta?.countryCode ?? DEFAULT_COUNTRY.value,
  );

  useEffect(() => {
    if (state.done) {
      analytics.track(Events.FIdDocCompleted, {
        result: 'success',
      });
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, onDone]);

  if (state.matches('docSelection')) {
    return (
      <DocSelection
        authToken={authToken}
        defaultCountry={country}
        defaultType={collectingDocumentMeta.type}
        onConsentCompleted={() => {
          analytics.track(Events.DocConsentAccepted);
          send('consentCompleted');
        }}
        onSubmit={(countryCode, documentType, docId) => {
          send('countryAndTypeSubmitted', {
            payload: { countryCode, documentType, docId },
          });
        }}
        shouldCollectConsent={shouldCollectConsent}
        supportedCountryAndDocTypes={supportedCountryAndDocTypes}
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
        authToken={authToken}
        country={country}
        docId={collectingDocumentMeta.docId}
        key={currentSide}
        onBack={() => {
          send('backButtonTapped');
        }}
        onDone={nextSideToCollect => {
          send('imageSubmitted', { payload: { nextSideToCollect } });
        }}
        onRetryLimitExceeded={() => {
          send('retryLimitExceeded');
        }}
        side={currentSide}
        type={collectingDocumentMeta.type}
      />
    );
  }
  return null;
};

export default IdDoc;
