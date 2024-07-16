import type { CountryRecord } from '@onefootprint/global-constants';
import type { ProcessDocResponse, SupportedIdDocTypes, UploadDocumentSide } from '@onefootprint/types';
import { Container } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Platform } from 'react-native';

import { PREVIEW_AUTH_TOKEN } from '@/config/constants';
import useRequestError from '@/hooks/use-request-error';
import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

import type { Document } from '../../doc-scan.types';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import Success from './components/success';
import TooManyAttempts from './components/too-many-attempts';
import useProcessDoc from './hooks/use-process-doc';
import useUploadDoc from './hooks/use-upload-doc';
import getPreviewNextSide from './utils/get-preview-next-side';

export type UploadProps = {
  children: React.ReactNode;
  country: CountryRecord;
  authToken: string;
  docId: string;
  onRetryLimitExceeded: () => void;
  onSuccess: (nextSideToCollect: UploadDocumentSide | null) => void;
  side: UploadDocumentSide;
  type: SupportedIdDocTypes;
};

const Upload = ({ country, side, authToken, onRetryLimitExceeded, onSuccess, docId, type, children }: UploadProps) => {
  const { t, allT } = useTranslation('scan.upload');
  const uploadMutation = useUploadDoc();
  const processMutation = useProcessDoc();
  const { getErrorMessage, getErrorCode } = useRequestError();
  const analytics = useAnalytics();
  const isPreview = PREVIEW_AUTH_TOKEN === authToken;
  const [document, setDocument] = useState<Document | null>(null);
  const [errors, setErrors] = useState<string[] | []>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRetryExceeded, setShowRetryExceeded] = useState(false);
  const showErrors = errors.length > 0;

  const handleReset = () => {
    setErrors([]);
    setShowSuccess(false);
    setShowRetryExceeded(false);
    setDocument(null);
  };

  const handleError = (error: unknown) => {
    const errorMessage = getErrorMessage(error);

    analytics.track(Events.DocUploadFailed, {
      side,
      type,
      docId,
      error: errorMessage,
    });
    setErrors([getErrorMessage(error)]);
  };

  const handleProcessDocSuccess = (response: ProcessDocResponse) => {
    if (response.isRetryLimitExceeded) {
      setShowRetryExceeded(true);
      setTimeout(() => {
        onRetryLimitExceeded();
      }, 3000);
      return;
    }
    if (response.errors.length > 0) {
      analytics.track(Events.DocUploadFailed, {
        side,
        type,
        docId,
        error: response.errors,
      });

      const documentType = allT(`id-doc.${type}`);
      const docSide = allT(`side.${side}`);
      setErrors(
        response.errors.map(error =>
          t(`errors.${error}`, {
            documentType,
            countryName: country.label,
            side: docSide,
          }),
        ),
      );
    } else {
      setShowSuccess(true);
      analytics.track(Events.DocUploadSucceeded, {
        side,
        type,
        docId,
      });

      setTimeout(() => {
        onSuccess(response.nextSideToCollect);
      }, 2500);
    }
  };

  const handleSubmitDocSuccess = () => {
    if (!docId) {
      return;
    }

    processMutation.mutate(
      {
        authToken,
        id: docId,
      },
      {
        onSuccess: handleProcessDocSuccess,
        onError: handleError,
      },
    );
  };

  const handleSubmitDocError = (error: unknown) => {
    const errorCode = getErrorCode(error);

    // This part of code may seem a little counter-intuitive
    // Sometimes the processing request might erroneously fail although BE successfully processes it
    // In those case we ask the user to upload the doc again which fails with the following error message
    // In reality the user completed the flow and should be able to move on in such cases
    // This piece of code ensures that
    if (errorCode === 'E109') {
      onSuccess(null);
      return;
    }

    handleError(error);
  };

  const handleSubmit = (newDocument: Document) => {
    setDocument(newDocument);
    setErrors([]);
    const { photo } = newDocument;

    if (isPreview) {
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess(getPreviewNextSide(side, type));
      }, 2500);
    } else {
      const data = new FormData();
      const file = {
        name: 'file.jpg',
        type: 'image/jpeg',
        uri: Platform.OS === 'android' ? `file:///${photo?.path}` : photo?.path,
      };
      // @ts-ignore
      data.append('file', file);
      uploadMutation.mutate(
        {
          authToken,
          data,
          docId,
          meta: photo?.metadata ?? {},
          side,
        },
        {
          onSuccess: handleSubmitDocSuccess,
          onError: handleSubmitDocError,
        },
      );
    }
  };

  return document ? (
    <Container center>
      {uploadMutation.isLoading && <Loading />}
      {showSuccess && <Success />}
      {showRetryExceeded && <TooManyAttempts />}
      {showErrors && <ErrorComponent errors={errors} onReset={handleReset} />}
    </Container>
  ) : (
    <>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child as JSX.Element, {
          onSubmit: handleSubmit,
        });
      })}
    </>
  );
};

export default Upload;
