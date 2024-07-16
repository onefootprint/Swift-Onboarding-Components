import { DEFAULT_COUNTRY, getCountryFromCode } from '@onefootprint/global-constants';
import type { DocumentRequirementConfig, IdDocRequirement } from '@onefootprint/types';
import { isIdentitydDoc } from '@onefootprint/types';
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
  const analytics = useAnalytics();
  const [state, send] = useMachine(() => createMachine(requirement));
  const { currentSide, collectingDocumentMeta } = state.context;
  const { shouldCollectConsent, supportedCountryAndDocTypes } = getIdDocConfig(requirement.config);
  const country = getCountryFromCode(collectingDocumentMeta?.countryCode ?? DEFAULT_COUNTRY.value) ?? DEFAULT_COUNTRY;

  useEffect(() => {
    if (state.done) {
      analytics.track(Events.FIdDocCompleted, {
        result: 'success',
      });
      onDone();
    }
  }, [state, onDone]);

  if (state.matches('docSelection')) {
    return (
      <DocSelection
        authToken={authToken}
        defaultCountry={country}
        defaultType={collectingDocumentMeta?.type}
        onConsentCompleted={() => {
          analytics.track(Events.DocConsentAccepted);
          send('consentCompleted');
        }}
        onSubmit={(countryCode, documentType, docId) => {
          send('countryAndTypeSubmitted', {
            payload: { countryCode, documentType, docId },
          });
        }}
        shouldCollectConsent={!!shouldCollectConsent}
        supportedCountryAndDocTypes={supportedCountryAndDocTypes}
      />
    );
  }

  const { docId, type } = collectingDocumentMeta || {};
  if (!docId || !type || !currentSide) {
    return null;
  }

  if (state.matches('frontImage') || state.matches('backImage') || state.matches('selfie')) {
    return (
      <DocScan
        authToken={authToken}
        country={country}
        docId={docId}
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
        type={type}
      />
    );
  }
  return null;
};

const getIdDocConfig = (config?: DocumentRequirementConfig) => {
  if (!isIdentitydDoc(config)) {
    throw new Error('Only identify document configs are supported');
  }
  return config;
};

export default IdDoc;
