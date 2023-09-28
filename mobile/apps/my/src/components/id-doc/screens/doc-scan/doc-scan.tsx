import { CountryRecord } from '@onefootprint/global-constants';
import { getErrorMessage } from '@onefootprint/request';
import {
  IdDocRequirement,
  SupportedIdDocTypes,
  UploadDocumentSide,
} from '@onefootprint/types';
import React, { useEffect, useMemo, useState } from 'react';

import { PREVIEW_AUTH_TOKEN } from '@/config/constants';
import useTranslation from '@/hooks/use-translation';

import DefaultDocument from './components/default-document';
import DriversLicense from './components/drivers-license';
import Passport from './components/passport';
import Context from './components/scan-context';
import Selfie from './components/selfie';
import ConsentDialog from './components/selfie/components/consent-dialog';
import useUploadDoc from './hooks/use-upload-doc';
import getPreviewNextSide from './utils/get-preview-next-side';

export type DocScanProps = {
  authToken: string;
  country: CountryRecord;
  docId: string;
  onBack?: () => void;
  onConsentCompleted: () => void;
  onDone: (nextSideToCollect: UploadDocumentSide) => void;
  onRetryLimitExceeded: () => void;
  requirement: IdDocRequirement;
  side: UploadDocumentSide;
  type: SupportedIdDocTypes;
};

const delayToShowConsentMS = 500;

const DocScan = ({
  authToken,
  country,
  docId,
  onBack,
  onConsentCompleted,
  onDone,
  onRetryLimitExceeded,
  requirement,
  side,
  type,
}: DocScanProps) => {
  const { t, allT } = useTranslation('components.scan.preview.errors');
  const [errors, setErrors] = useState([]);
  const [showConsent, setShowConsent] = useState(false);
  const { shouldCollectConsent } = requirement;
  const isPreview = PREVIEW_AUTH_TOKEN === authToken;
  const uploadMutation = useUploadDoc();

  useEffect(() => {
    setTimeout(() => {
      if (shouldCollectConsent) {
        setShowConsent(true);
      }
    }, delayToShowConsentMS);
  }, []);

  const handleResetErrors = () => {
    setErrors([]);
  };

  const handleSubmit = (image: string, meta: Record<string, boolean>) => {
    if (isPreview) {
      onDone(getPreviewNextSide(side, type));
    } else {
      uploadMutation.mutate(
        {
          authToken,
          docId,
          image,
          meta,
          mimeType: 'image/jpeg',
          side,
        },
        {
          onSuccess: response => {
            if (response.errors.length > 0) {
              const documentType = allT(`id-doc.${type}`);
              const docSide = allT(`side.${side}`);
              setErrors(
                response.errors.map(error =>
                  t(error, {
                    documentType,
                    countryName: country.label,
                    side: docSide,
                  }),
                ),
              );
              if (response.isRetryLimitExceeded) {
                onRetryLimitExceeded();
              }
            } else {
              setTimeout(() => {
                onDone(response.nextSideToCollect);
              }, 1500);
            }
          },
          onError: (error: unknown) => {
            setErrors([getErrorMessage(error)]);
          },
        },
      );
    }
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
      onBack,
    }),
    [authToken, country, errors, uploadMutation],
  );

  const isPassport = type === SupportedIdDocTypes.passport;
  const isDriversLicense = type === SupportedIdDocTypes.driversLicense;
  const isDefaultDocument = !isPassport && !isDriversLicense;

  return (
    <Context.Provider value={contextValues}>
      {showConsent && (
        <ConsentDialog authToken={authToken} onCompleted={onConsentCompleted} />
      )}
      {side === UploadDocumentSide.Selfie ? (
        <Selfie />
      ) : (
        <>
          {isPassport && <Passport side={side} />}
          {isDriversLicense && <DriversLicense side={side} />}
          {isDefaultDocument && <DefaultDocument type={type} side={side} />}
        </>
      )}
    </Context.Provider>
  );
};

export default DocScan;
