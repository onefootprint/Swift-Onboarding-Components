import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import type { IdDocImageTypes, ProcessDocResponse } from '@onefootprint/types';
import { IdDocImageProcessingError } from '@onefootprint/types';
import { Button, media, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce, useTimeout } from 'usehooks-ts';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import StickyBottomBox from '../../../../components/layout/components/sticky-bottom-box';
import Logger from '../../../../utils/logger';
import DesktopHeader from '../../components/desktop-header';
import IdDocAnimation from '../../components/id-doc-animation';
import Loading from '../../components/loading';
import RetryLimitExceeded from '../../components/retry-limit-exceeded';
import Success from '../../components/success';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../constants/desktop-interaction-box.constants';
import {
  NOT_PENDING_UPLOAD_ERROR,
  SLOW_CONNECTION_MESSAGE_TIMEOUT,
} from '../../constants/processing.constants';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useProcessDoc from '../../hooks/use-process-doc';
import useSubmitDoc from '../../hooks/use-submit-doc';

const DeskTopProcessing = () => {
  const { t } = useTranslation('pages.desktop-processing');
  const [state, send] = useIdDocMachine();
  const submitDocMutation = useSubmitDoc();
  const processDocMutation = useProcessDoc();
  const [mode, setMode] = useState<'loading' | 'success'>('loading');
  const [nextSide, setNextSide] = useState<IdDocImageTypes | undefined>();
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] =
    useState(false);
  const [retryLimitExceeded, setRetryLimitExceeded] = useState(false);
  const [isMissingRequirements, setIsMissingRequirements] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyze'>('upload');

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
        'desktop-processing',
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
      const error = `Desktop web flow - id-doc image could not be processed due to missing requirements. Requirements - image: ${
        image ? 'OK' : 'undefined'
      }, auth token: ${authToken ? 'OK' : 'undefined'}, doc type: ${
        type ? 'OK' : 'undefined'
      }, country: ${country ? 'OK' : 'undefined'}, current side: ${
        currSide ? 'OK' : 'undefined'
      }, id: ${id ? 'OK' : 'undefined'}`;
      Logger.error(error, 'desktop-processing');
      return;
    }

    const { imageFile, extraCompressed, captureKind } = image;
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
      },
    );
  });

  const isLoading = submitDocMutation.isLoading || processDocMutation.isLoading;
  const isSuccess = submitDocMutation.isSuccess && processDocMutation.isSuccess;
  useTimeout(
    () => {
      if (isSuccess) {
        return;
      }
      setShowSlowConnectionMessage(true);
    },
    isLoading ? SLOW_CONNECTION_MESSAGE_TIMEOUT : null,
  );

  const handleNextStep = () => {
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
    <Container>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <DesktopHeader type={type} country={country} imageType={currSide} />
      <FeedbackContainer height={DESKTOP_INTERACTION_BOX_HEIGHT}>
        <IdDocAnimation
          loadingComponent={
            <Loading
              step={step}
              imageType={currSide}
              showSlowConnectionMessage={showSlowConnectionMessage}
            />
          }
          successComponent={<Success />}
          mode={mode}
          hasNextSide={false} // Although we might have next side, we don't want to show it in the animation for desktop
        />
      </FeedbackContainer>
      <StickyBottomBox>
        <Button
          fullWidth
          disabled={mode === 'loading'}
          onClick={handleNextStep}
        >
          {t('continue')}
        </Button>
      </StickyBottomBox>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    margin-bottom: calc(-1 * ${theme.spacing[8]});

    ${media.lessThan('md')`
      padding: 0 ${theme.spacing[3]}; 
    `}
  `}
`;

const FeedbackContainer = styled.div<{
  height: number;
}>`
  ${({ theme, height }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: ${height}px;
    background-color: ${theme.backgroundColor.secondary};
    border: 1px dashed ${theme.borderColor.primary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default DeskTopProcessing;
