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

import DriversLicense from './components/drivers-license';
import IdCard from './components/id-card';
import Passport from './components/passport';
import ResidenceDocument from './components/residence-document';
import Context from './components/scan-context';
import Selfie from './components/selfie';
import ConsentDialog from './components/selfie/components/consent-dialog';
import { StepperProps } from './components/stepper';
import Visa from './components/visa';
import WorkPermit from './components/work-permit';
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
  stepperValues: StepperProps;
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
  stepperValues,
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

  const handleSubmit = (image: string) => {
    if (isPreview) {
      onDone(getPreviewNextSide(side, type));
    } else {
      uploadMutation.mutate(
        {
          docId,
          image,
          authToken,
          side,
          mimeType: 'image/jpeg',
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

  return (
    <Context.Provider value={contextValues}>
      {showConsent && (
        <ConsentDialog authToken={authToken} onCompleted={onConsentCompleted} />
      )}
      {side === UploadDocumentSide.Selfie ? (
        <Selfie stepperValues={stepperValues} />
      ) : (
        <>
          {type === SupportedIdDocTypes.passport && (
            <Passport stepperValues={stepperValues} />
          )}
          {type === SupportedIdDocTypes.driversLicense && (
            <DriversLicense side={side} stepperValues={stepperValues} />
          )}
          {type === SupportedIdDocTypes.idCard && (
            <IdCard side={side} stepperValues={stepperValues} />
          )}
          {type === SupportedIdDocTypes.residenceDocument && (
            <ResidenceDocument side={side} stepperValues={stepperValues} />
          )}
          {type === SupportedIdDocTypes.workPermit && (
            <WorkPermit side={side} stepperValues={stepperValues} />
          )}
          {type === SupportedIdDocTypes.visa && (
            <Visa stepperValues={stepperValues} />
          )}
        </>
      )}
    </Context.Provider>
  );
};

export default DocScan;
