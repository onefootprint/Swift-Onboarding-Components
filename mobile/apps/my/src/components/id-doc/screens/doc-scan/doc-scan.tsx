import { CountryRecord } from '@onefootprint/global-constants';
import { getErrorMessage } from '@onefootprint/request';
import { SupportedIdDocTypes, UploadDocumentSide } from '@onefootprint/types';
import React, { useMemo, useState } from 'react';

import useTranslation from '@/hooks/use-translation';

import DriversLicense from './components/drivers-license';
import IdCard from './components/id-card';
import Passport from './components/passport';
import Context from './components/scan-context';
import Selfie from './components/selfie';
import useUploadDoc from './hooks/use-upload-doc';

export type DocScanProps = {
  authToken: string;
  country: CountryRecord;
  onDone: (nextSideToCollect: UploadDocumentSide) => void;
  side: UploadDocumentSide;
  type: SupportedIdDocTypes;
  docId: string;
};

const DocScan = ({
  authToken,
  country,
  onDone,
  side,
  type,
  docId,
}: DocScanProps) => {
  const { t, allT } = useTranslation('components.scan.preview.errors');
  const [errors, setErrors] = useState([]);

  const uploadMutation = useUploadDoc({
    onError: error => {
      setErrors([getErrorMessage(error)]);
    },
  });

  const handleResetErrors = () => {
    setErrors([]);
  };

  const handleSubmit = (image: string) => {
    uploadMutation.mutate(
      {
        docId,
        image,
        authToken,
        side,
        mimeType: 'image/png',
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
      isLoading: uploadMutation.isLoading,
      isSuccess:
        uploadMutation.isSuccess && uploadMutation.data.errors.length === 0,
      onSubmit: handleSubmit,
      onResetErrors: handleResetErrors,
    }),
    [authToken, country, errors, uploadMutation],
  );

  return (
    <Context.Provider value={contextValues}>
      {side === UploadDocumentSide.Selfie ? (
        <Selfie />
      ) : (
        <>
          {type === SupportedIdDocTypes.driversLicense && (
            <DriversLicense side={side} />
          )}
          {type === SupportedIdDocTypes.idCard && <IdCard side={side} />}
          {type === SupportedIdDocTypes.passport && <Passport />}
        </>
      )}
    </Context.Provider>
  );
};

export default DocScan;
