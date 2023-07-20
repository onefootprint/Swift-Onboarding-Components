import { CountryRecord } from '@onefootprint/global-constants';
import { getErrorMessage } from '@onefootprint/request';
import { IdDocType, SubmitDocumentSide } from '@onefootprint/types';
import React, { useMemo, useState } from 'react';

import useTranslation from '@/hooks/use-translation';

import DriversLicense from './components/drivers-license';
import IdCard from './components/id-card';
import Passport from './components/passport';
import Context from './components/scan-context';
import Selfie from './components/selfie';
import useSubmitDoc from './hooks/use-submit-doc';

export type DocScanProps = {
  authToken: string;
  country: CountryRecord;
  onDone: (nextSideToCollect: SubmitDocumentSide) => void;
  side: SubmitDocumentSide;
  type: IdDocType;
};

const DocScan = ({ authToken, country, onDone, side, type }: DocScanProps) => {
  const { t, allT } = useTranslation('components.scan.preview.errors');
  const [errors, setErrors] = useState([]);
  const mutation = useSubmitDoc({
    onError: error => {
      setErrors([getErrorMessage(error)]);
    },
  });

  const handleResetErrors = () => {
    setErrors([]);
  };

  const handleSubmit = (image: string) => {
    mutation.mutate(
      {
        authToken,
        countryCode: country.value,
        documentType: type,
        selfieImage: side === SubmitDocumentSide.Selfie ? image : null,
        frontImage: side === SubmitDocumentSide.Front ? image : null,
        backImage: side === SubmitDocumentSide.Back ? image : null,
      },
      {
        onSuccess: response => {
          if (response.errors.length > 0) {
            const documentType = allT(`document-type.${type}`);
            setErrors(
              response.errors.map(error =>
                t(error, { documentType, countryName: country.label }),
              ),
            );
          } else {
            setTimeout(() => {
              onDone(response.nextSideToCollect);
            }, 1500);
          }
        },
      },
    );
  };

  const contextValues = useMemo(
    () => ({
      country,
      authToken,
      errors,
      isError: errors.length > 0,
      isLoading: mutation.isLoading,
      isSuccess: mutation.isSuccess && mutation.data.errors.length === 0,
      onSubmit: handleSubmit,
      onResetErrors: handleResetErrors,
    }),
    [authToken, country, errors, mutation],
  );

  return (
    <Context.Provider value={contextValues}>
      {side === SubmitDocumentSide.Selfie ? (
        <Selfie authToken={authToken} />
      ) : (
        <>
          {type === IdDocType.driversLicense && <DriversLicense side={side} />}
          {type === IdDocType.idCard && <IdCard side={side} />}
          {type === IdDocType.passport && <Passport />}
        </>
      )}
    </Context.Provider>
  );
};

export default DocScan;
