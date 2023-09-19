import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import {
  type IdDocImageTypes,
  type SubmitDocResponse,
  IdDocImageProcessingError,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import IdDocAnimation from '../../components/id-doc-animation';
import Loading from '../../components/loading';
import NextSide from '../../components/next-side';
import RetryLimitExceeded from '../../components/retry-limit-exceeded';
import Success from '../../components/success';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useSubmitDoc from '../../hooks/use-submit-doc';

const Processing = () => {
  const { t } = useTranslation('pages.processing');
  const [state, send] = useIdDocMachine();
  const submitDocMutation = useSubmitDoc();
  const [mode, setMode] = useState<'loading' | 'success'>('loading');
  const [nextSide, setNextSide] = useState<IdDocImageTypes | undefined>();
  const [retryLimitExceeded, setRetryLimitExceeded] = useState(false);
  const [isMissingRequirements, setIsMissingRequirements] = useState(false);

  const {
    idDoc: { type, country },
    image,
    authToken,
    currSide,
    id,
  } = state.context;

  const handleSubmitDocSuccess = (data: SubmitDocResponse) => {
    const { errors, nextSideToCollect, isRetryLimitExceeded } = data;

    // If we are staying on the same side, we show error
    // If we are moving on from the current side, we show success
    // If there is no next side, the flow is complete
    if (isRetryLimitExceeded) {
      console.error('Image upload retry limit exceeded');
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

  const handleSubmitDocError = (err: unknown) => {
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

  useEffectOnce(() => {
    if (!image || !authToken || !type || !country || !currSide || !id) {
      setIsMissingRequirements(true);
      console.error(
        `Mobile web flow - id-doc image could not be processed due to missing requirements. Requirements - image: ${
          image ? 'OK' : 'undefined'
        }, auth token: ${authToken ? 'OK' : 'undefined'}, doc type: ${
          type ? 'OK' : 'undefined'
        }, country: ${country ? 'OK' : 'undefined'}, current side: ${
          currSide ? 'OK' : 'undefined'
        }, id: ${id ? 'OK' : 'undefined'}`,
      );
      return;
    }

    const { imageString, mimeType, captureKind } = image;

    submitDocMutation.mutate(
      {
        authToken,
        image: imageString,
        mimeType,
        side: currSide,
        id,
        meta: {
          manual: captureKind ? captureKind === 'manual' : captureKind,
        },
      },
      {
        onSuccess: handleSubmitDocSuccess,
        onError: err => {
          console.error(
            `Id-doc image submit failed. Side: ${currSide}, upload session id: ${id}. Error: ${getErrorMessage(
              err,
            )}`,
          );
          handleSubmitDocError(err);
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
    <IdDocAnimation
      loadingComponent={<Loading imageType={currSide} />}
      successComponent={
        <Success
          imageType={currSide}
          docType={type}
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
  );
};

export default Processing;
