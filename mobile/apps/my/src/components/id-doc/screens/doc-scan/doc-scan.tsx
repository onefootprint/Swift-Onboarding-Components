import {
  CountryCode,
  IdDocType,
  SubmitDocumentSide,
} from '@onefootprint/types';
import React from 'react';

import DriversLicense from './components/drivers-license';
import IdCard from './components/id-card';
import Passport from './components/passport';
import Selfie from './components/selfie';
import useSubmitDoc from './hooks/use-submit-doc';

export type DocScanProps = {
  authToken: string;
  countryCode: CountryCode;
  onDone: (nextSideToCollect: SubmitDocumentSide) => void;
  side: SubmitDocumentSide;
  type: IdDocType;
};

const DocScan = ({
  authToken,
  countryCode,
  onDone,
  side,
  type,
}: DocScanProps) => {
  const submitDocMutation = useSubmitDoc();

  const handleSubmit = (image: string) => {
    submitDocMutation.mutate(
      {
        authToken,
        countryCode,
        documentType: type,
        selfieImage: side === SubmitDocumentSide.Selfie ? image : null,
        frontImage: side === SubmitDocumentSide.Front ? image : null,
        backImage: side === SubmitDocumentSide.Back ? image : null,
      },
      {
        onSuccess: response => {
          setTimeout(() => {
            onDone(response.nextSideToCollect);
          }, 1500);
        },
      },
    );
  };

  if (side === SubmitDocumentSide.Selfie) {
    return (
      <Selfie
        success={submitDocMutation.isSuccess}
        authToken={authToken}
        loading={submitDocMutation.isLoading}
        onSubmit={handleSubmit}
      />
    );
  }
  if (type === IdDocType.driversLicense) {
    return (
      <DriversLicense
        success={submitDocMutation.isSuccess}
        loading={submitDocMutation.isLoading}
        onSubmit={handleSubmit}
        side={side}
      />
    );
  }
  if (type === IdDocType.idCard) {
    return (
      <IdCard
        success={submitDocMutation.isSuccess}
        loading={submitDocMutation.isLoading}
        onSubmit={handleSubmit}
        side={side}
      />
    );
  }
  return (
    <Passport
      success={submitDocMutation.isSuccess}
      loading={submitDocMutation.isLoading}
      onSubmit={handleSubmit}
    />
  );
};

export default DocScan;
