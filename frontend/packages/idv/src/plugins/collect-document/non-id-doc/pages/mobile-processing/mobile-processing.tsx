import { useRequestError } from '@onefootprint/request';
import type { ProcessDocResponse } from '@onefootprint/types';
import {
  IdDocImageProcessingError,
  IdDocImageTypes,
} from '@onefootprint/types';
import { Box, Text } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import Logger from '../../../../../utils/logger';
import IdDocAnimation from '../../../components/id-doc-animation';
import Loading from '../../../components/loading';
import RetryLimitExceeded from '../../../components/retry-limit-exceeded';
import Success from '../../../components/success';
import SLOW_CONNECTION_MESSAGE_TIMEOUT from '../../../constants/processing.constants';
import useProcessDoc from '../../../hooks/use-process-doc';
import useSubmitDoc from '../../../hooks/use-submit-doc';
import { useNonIdDocMachine } from '../../components/machine-provider';

const MobileProcessing = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.non-id-doc.pages.desktop-processing',
  });
  const { getErrorMessage, getErrorCode } = useRequestError();
  const [state, send] = useNonIdDocMachine();
  const submitDocMutation = useSubmitDoc();
  const processDocMutation = useProcessDoc();
  const [mode, setMode] = useState<'loading' | 'success'>('loading');
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] =
    useState(false);
  const [retryLimitExceeded, setRetryLimitExceeded] = useState(false);
  const [isMissingRequirements, setIsMissingRequirements] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyze'>('upload');
  const slowConnectionTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  ); // we only time the doc upload

  const { document, authToken, id, config } = state.context;
  const { kind: documentRequestKind } = config;

  const handleProcessDocSuccess = (data: ProcessDocResponse) => {
    const { errors, nextSideToCollect, isRetryLimitExceeded } = data;

    // If we are staying on the same side, we show error
    // If we are moving on from the current side, we show success
    // If there is no next side, the flow is complete
    if (isRetryLimitExceeded) {
      Logger.error(
        `Image upload retry limit exceeded. doc: ${documentRequestKind}, doc id: ${id}`,
        'desktop-processing',
      );
      setRetryLimitExceeded(true);
    } else if (nextSideToCollect === IdDocImageTypes.front) {
      send({
        type: 'processingErrored',
        payload: {
          errors: errors.map(err => ({
            errorType: err,
          })),
        },
      });
    } else if (!nextSideToCollect) {
      setMode('success');
    } else {
      Logger.error(
        `Unexpected next side to collect in non-id-doc flow. Side: ${nextSideToCollect}`,
        'mobile-processing',
      );
    }
  };

  const handleError = (err: unknown) => {
    send({
      type: 'processingErrored',
      payload: {
        errors: [
          {
            errorType: IdDocImageProcessingError.networkError,
            errorInfo: getErrorMessage(err),
          },
        ],
      },
    });
  };

  const handleProcessDocError = (error: unknown) => {
    Logger.error(
      `Error while processing non id-doc image ${id}: ${getErrorMessage(
        error,
      )}`,
      'processing',
    );
    handleError(error);
  };

  const handleSubmitDocError = (error: unknown) => {
    const errorCode = getErrorCode(error);
    const errorMessage = getErrorMessage(error);

    // This part of code may seem a little counter-intuitive
    // Sometimes the processing request might erroneously fail although BE successfully processes it
    // In those case we ask the user to upload the doc again which fails with the following error message
    // In reality the user completed the flow and should be able to move on in such cases
    // This piece of code ensures that
    if (errorCode === 'E109') {
      setMode('success');
      return;
    }

    Logger.error(
      `Non id-doc image submit failed on phone flow. Document kind: ${documentRequestKind}, upload session id: ${id}. Error: ${errorMessage}`,
      'processing',
    );
    handleError(error);
  };

  const handleSubmitDocSuccess = () => {
    if (!id) {
      return;
    }
    setStep('analyze');

    processDocMutation.mutate(
      {
        authToken,
        id,
      },
      {
        onSuccess: handleProcessDocSuccess,
        onError: handleProcessDocError,
      },
    );
  };

  useEffectOnce(() => {
    if (!document || !authToken || !id) {
      setIsMissingRequirements(true);
      const error = `Desktop web flow - id-doc image could not be processed due to missing requirements. Requirements - document: ${
        document ? 'OK' : 'undefined'
      }, auth token: ${authToken ? 'OK' : 'undefined'}, id: ${
        id ? 'OK' : 'undefined'
      }`;
      Logger.error(error, 'desktop-processing');
      return;
    }

    if (!slowConnectionTimer.current) {
      slowConnectionTimer.current = setTimeout(() => {
        if (submitDocMutation.isSuccess) {
          return;
        }
        setShowSlowConnectionMessage(true);
      }, SLOW_CONNECTION_MESSAGE_TIMEOUT);
    }

    const { imageFile, extraCompressed, captureKind } = document;
    submitDocMutation.mutate(
      {
        authToken,
        image: imageFile,
        extraCompress: extraCompressed,
        side: IdDocImageTypes.front,
        id,
        meta: {
          manual: captureKind === 'manual',
          isUpload: captureKind === 'upload',
        },
      },
      {
        onSuccess: handleSubmitDocSuccess,
        onError: handleSubmitDocError,
        onSettled: () => {
          if (slowConnectionTimer.current) {
            clearTimeout(slowConnectionTimer.current);
            setShowSlowConnectionMessage(false);
          }
        },
      },
    );
  });

  const handleSuccess = () => {
    send({
      type: 'processingSucceeded',
    });
  };

  if (isMissingRequirements) {
    return (
      <Text variant="label-1" color="error" textAlign="center">
        {t('missing-requirement-error')}
      </Text>
    );
  }

  const handleRetryLimitExceeded = () => {
    send({
      type: 'retryLimitExceeded',
    });
  };

  if (retryLimitExceeded)
    return (
      <RetryLimitExceeded onRetryLimitExceeded={handleRetryLimitExceeded} />
    );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <IdDocAnimation
        loadingComponent={
          <Loading
            step={step}
            showSlowConnectionMessage={showSlowConnectionMessage}
          />
        }
        successComponent={<Success onComplete={handleSuccess} />}
        mode={mode}
        hasNextSide={false}
      />
    </Box>
  );
};

export default MobileProcessing;
