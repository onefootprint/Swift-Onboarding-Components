import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import {
  type IdDocImageTypes,
  type SubmitDocResponse,
  IdDocImageProcessingError,
} from '@onefootprint/types';
import { Button, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { NavigationHeader } from '../../../../components';
import DesktopHeader from '../../components/desktop-header';
import IdDocAnimation from '../../components/id-doc-animation';
import Loading from '../../components/loading';
import RetryLimitExceeded from '../../components/retry-limit-exceeded';
import Success from '../../components/success';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../constants/desktop-interaction-box.constants';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useSubmitDoc from '../../hooks/use-submit-doc';

const DeskTopProcessing = () => {
  const { t } = useTranslation('pages.desktop-processing');
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
            `Id-doc image submit failed on desktop flow. Side: ${currSide}, upload session id: ${id}. Error: ${getErrorMessage(
              err,
            )}`,
          );
          handleSubmitDocError(err);
        },
      },
    );
  });

  const handleNextStep = () => {
    send({
      type: 'processingSucceeded',
      payload: { nextSideToCollect: nextSide },
    });
  };

  if (isMissingRequirements) {
    console.error(
      'Desktop flow - id-doc image could not be processed due to missing requirements',
    );
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
      <NavigationHeader />
      <DesktopHeader type={type} country={country} imageType={currSide} />
      <FeedbackContainer height={DESKTOP_INTERACTION_BOX_HEIGHT}>
        <IdDocAnimation
          loadingComponent={<Loading imageType={currSide} />}
          successComponent={
            <Success
              imageType={currSide}
              docType={type}
              backgroundColor="secondary"
            />
          }
          mode={mode}
          hasNextSide={false} // Although we might have next side, we don't want to show it in the animation for desktop
        />
      </FeedbackContainer>
      <Button fullWidth disabled={mode === 'loading'} onClick={handleNextStep}>
        {t('continue')}
      </Button>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
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
