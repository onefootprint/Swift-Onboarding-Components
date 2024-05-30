import { useRequestError } from '@onefootprint/request';
import type { ProcessDocResponse } from '@onefootprint/types';
import {
  IdDocImageProcessingError,
  IdDocImageTypes,
} from '@onefootprint/types';
import { Button, media, Text } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { HeaderTitle } from '../../../../../components';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import { getLogger } from '../../../../../utils/logger';
import IdDocAnimation from '../../../components/id-doc-animation';
import Loading from '../../../components/loading';
import RetryLimitExceeded from '../../../components/retry-limit-exceeded';
import Success from '../../../components/success';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../../constants/desktop-interaction-box.constants';
import SLOW_CONNECTION_MESSAGE_TIMEOUT from '../../../constants/processing.constants';
import useProcessDoc from '../../../hooks/use-process-doc';
import useSubmitDoc from '../../../hooks/use-submit-doc';
import transformCase from '../../../id-doc/utils/transform-case';
import { bytesToMegabytes } from '../../../utils/capture';
import { useNonIdDocMachine } from '../../components/machine-provider';
import useDocName from '../../hooks/use-doc-name';

const { logError, logInfo, logWarn } = getLogger({
  location: 'non-id-doc-desktop-processing',
});

const DesktopProcessing = () => {
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
  const documentName = transformCase(
    useDocName(config),
    'first-letter-upper-only',
  );

  const handleProcessDocSuccess = (data: ProcessDocResponse) => {
    const { errors, nextSideToCollect, isRetryLimitExceeded } = data;

    // If we are staying on the same side, we show error
    // If we are moving on from the current side, we show success
    // If there is no next side, the flow is complete
    if (isRetryLimitExceeded) {
      logWarn(
        `Image upload retry limit exceeded. doc: ${documentRequestKind}, doc id: ${id}`,
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
      logError(
        `Unexpected next side to collect flow. Side: ${nextSideToCollect}`,
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

  const handleProcessDocError = (err: unknown) => {
    handleError(err);
    logWarn(`Error while processing image ${id}: ${getErrorMessage(err)}`, err);
  };

  const handleSubmitDocError = (err: unknown) => {
    const errorCode = getErrorCode(err);
    const errorMessage = getErrorMessage(err);

    // This part of code may seem a little counter-intuitive
    // Sometimes the processing request might erroneously fail although BE successfully processes it
    // In those case we ask the user to upload the doc again which fails with the following error message
    // In reality the user completed the flow and should be able to move on in such cases
    // This piece of code ensures that
    if (errorCode === 'E109') {
      setMode('success');
      return;
    }

    handleError(err);
    logError(
      `Submit failed on phone flow. Document kind: ${documentRequestKind}, upload session id: ${id}. Error: ${errorMessage}`,
    );
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
      logError(error);
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
    logInfo(
      `Uploading image with size ${bytesToMegabytes(imageFile.size)} MB and type ${imageFile.type} in POST request`,
    );
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

  const handleRetryLimitExceeded = () => {
    send({
      type: 'retryLimitExceeded',
    });
  };

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
  if (retryLimitExceeded)
    return (
      <RetryLimitExceeded onRetryLimitExceeded={handleRetryLimitExceeded} />
    );

  return (
    <Container>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <HeaderTitle title={documentName} />
      <FeedbackContainer height={DESKTOP_INTERACTION_BOX_HEIGHT}>
        <IdDocAnimation
          loadingComponent={
            <Loading
              step={step}
              showSlowConnectionMessage={showSlowConnectionMessage}
            />
          }
          successComponent={<Success />}
          mode={mode}
          hasNextSide={false} // Although we might have next side, we don't want to show it in the animation for desktop
        />
      </FeedbackContainer>
      <Button
        fullWidth
        disabled={mode === 'loading'}
        onClick={handleSuccess}
        size="large"
      >
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

export default DesktopProcessing;
