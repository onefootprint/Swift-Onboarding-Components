import { getErrorMessage } from '@onefootprint/request';
import type { IdDocImageTypes, ProcessDocResponse } from '@onefootprint/types';
import { IdDocImageProcessingError } from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import Logger from '../../../../utils/logger';
import IdDocAnimation from '../../components/id-doc-animation';
import Loading from '../../components/loading';
import NextSide from '../../components/next-side';
import RetryLimitExceeded from '../../components/retry-limit-exceeded';
import Success from '../../components/success';
import {
  NOT_PENDING_UPLOAD_ERROR,
  SLOW_CONNECTION_MESSAGE_TIMEOUT,
} from '../../constants/processing.constants';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useProcessDoc from '../../hooks/use-process-doc';
import useSubmitDoc from '../../hooks/use-submit-doc';

const Processing = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'id-doc.pages.processing' });
  const [state, send] = useIdDocMachine();
  const submitDocMutation = useSubmitDoc();
  const processDocMutation = useProcessDoc();
  const [mode, setMode] = useState<'loading' | 'success'>('loading');
  const [nextSide, setNextSide] = useState<IdDocImageTypes | undefined>();
  const [retryLimitExceeded, setRetryLimitExceeded] = useState(false);
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] =
    useState(false);
  const [isMissingRequirements, setIsMissingRequirements] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyze'>('upload');
  const slowConnectionTimer = useRef<NodeJS.Timer | null>(null); // we only time the doc upload

  const {
    idDoc: { type, country },
    image,
    authToken,
    currSide,
    id,
  } = state.context;

  const handleProcessDocSuccess = (data: ProcessDocResponse) => {
    const { errors, nextSideToCollect, isRetryLimitExceeded } = data;

    // If we are staying on the same side, we show error
    // If we are moving on from the current side, we show success
    // If there is no next side, the flow is complete
    if (isRetryLimitExceeded) {
      Logger.error(
        `Image upload retry limit exceeded. Side: ${currSide}, doc id: ${id}`,
        'processing',
      );
      setRetryLimitExceeded(true);
    } else if (nextSideToCollect === state.context.currSide) {
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
      setMode('success');
      setNextSide(nextSideToCollect as IdDocImageTypes);
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
      `Error while processing id-doc image ${id}: ${getErrorMessage(error)}`,
      'processing',
    );
    handleError(error);
  };

  const handleSubmitDocError = (error: unknown) => {
    const errorMessage = getErrorMessage(error);

    // This part of code may seem a little counter-intuitive
    // Sometimes the processing request might erroneously fail although BE successfully processes it
    // In those case we ask the user to upload the doc again which fails with the following error message
    // In reality the user completed the flow and should be able to move on in such cases
    // This piece of code ensures that
    if (errorMessage === NOT_PENDING_UPLOAD_ERROR) {
      setNextSide(undefined);
      setMode('success');
      return;
    }

    Logger.error(
      `Id-doc image submit failed on phone flow. Side: ${currSide}, upload session id: ${id}. Error: ${errorMessage}`,
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
    if (!image || !authToken || !type || !country || !currSide || !id) {
      setIsMissingRequirements(true);
      const error = `Mobile web flow - id-doc image could not be processed due to missing requirements. Requirements - image: ${
        image ? 'OK' : 'undefined'
      }, auth token: ${authToken ? 'OK' : 'undefined'}, doc type: ${
        type ? 'OK' : 'undefined'
      }, country: ${country ? 'OK' : 'undefined'}, current side: ${
        currSide ? 'OK' : 'undefined'
      }, id: ${id || 'undefined'}`;
      Logger.error(error, 'processing');
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

    const { imageFile, extraCompressed, captureKind } = image;
    Logger.info(
      `Processing: size of the file to be sent in POST request is ${imageFile.size}, file type ${imageFile.type}`,
    );
    submitDocMutation.mutate(
      {
        authToken,
        image: imageFile,
        extraCompress: extraCompressed,
        side: currSide,
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

  const onSuccessComplete = () => {
    send({
      type: 'processingSucceeded',
      payload: { nextSideToCollect: undefined },
    });
  };

  const onNextSideComplete = () => {
    send({
      type: 'processingSucceeded',
      payload: { nextSideToCollect: nextSide },
    });
  };

  if (isMissingRequirements) {
    return (
      <Typography variant="label-1" color="error" sx={{ textAlign: 'center' }}>
        {t('missing-requirement-error')}
      </Typography>
    );
  }
  if (retryLimitExceeded) return <RetryLimitExceeded />;
  if (!type || !currSide) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <IdDocAnimation
        loadingComponent={
          <Loading
            step={step}
            imageType={currSide}
            showSlowConnectionMessage={showSlowConnectionMessage}
          />
        }
        successComponent={
          <Success
            onComplete={
              mode === 'success' && !nextSide ? onSuccessComplete : undefined
            }
          />
        }
        nextSideComponent={
          nextSide && (
            <NextSide
              nextSideImageType={nextSide}
              onComplete={onNextSideComplete}
            />
          )
        }
        mode={mode}
        hasNextSide={!!nextSide}
      />
    </Box>
  );
};

export default Processing;
