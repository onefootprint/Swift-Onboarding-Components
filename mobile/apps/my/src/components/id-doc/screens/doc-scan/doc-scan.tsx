import { CountryCode, IdDocType } from '@onefootprint/types';
import React from 'react';

import { DocSide } from '../../id-doc.types';
import DriversLicense from './components/drivers-license';
import IdCard from './components/id-card';
import Passport from './components/passport';
import useSubmitDoc from './hooks/use-submit-doc';

export type DocScanProps = {
  authToken: string;
  countryCode: CountryCode;
  onDone: () => void;
  side: DocSide;
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
        frontImage: side === 'front' ? image : null,
        backImage: side === 'back' ? image : null,
      },
      {
        onSuccess: res => {
          alert(JSON.stringify(res));
          onDone();
        },
      },
    );
  };

  if (type === IdDocType.driversLicense) {
    return <DriversLicense side={side} onSubmit={handleSubmit} />;
  }
  if (type === IdDocType.idCard) {
    return <IdCard side={side} onSubmit={handleSubmit} />;
  }
  return <Passport onSubmit={handleSubmit} />;
};

export default DocScan;
