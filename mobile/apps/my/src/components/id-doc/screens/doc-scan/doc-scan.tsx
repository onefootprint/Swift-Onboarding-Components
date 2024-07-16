import type { CountryRecord } from '@onefootprint/global-constants';
import { SupportedIdDocTypes, UploadDocumentSide } from '@onefootprint/types';
import React from 'react';

import DefaultDocument from './components/default-document';
import DriversLicense from './components/drivers-license';
import Passport from './components/passport';
import Selfie from './components/selfie';
import Upload from './components/upload';

export type DocScanProps = {
  authToken: string;
  country: CountryRecord;
  docId: string;
  onBack?: () => void;
  onDone: (nextSideToCollect: UploadDocumentSide | null) => void;
  onRetryLimitExceeded: () => void;
  side: UploadDocumentSide;
  type: SupportedIdDocTypes;
};

const DocScan = ({ country, authToken, docId, onBack, onRetryLimitExceeded, onDone, side, type }: DocScanProps) => {
  const renderDocumentType = () => {
    if (side === UploadDocumentSide.Selfie) {
      return <Selfie />;
    }
    if (type === SupportedIdDocTypes.passport) {
      return <Passport onBack={onBack} />;
    }
    if (type === SupportedIdDocTypes.driversLicense) {
      return <DriversLicense country={country} onBack={onBack} side={side} />;
    }
    return <DefaultDocument onBack={onBack} side={side} type={type} />;
  };

  return (
    <Upload
      authToken={authToken}
      country={country}
      docId={docId}
      onRetryLimitExceeded={onRetryLimitExceeded}
      onSuccess={onDone}
      side={side}
      type={type}
    >
      {renderDocumentType()}
    </Upload>
  );
};

export default DocScan;
