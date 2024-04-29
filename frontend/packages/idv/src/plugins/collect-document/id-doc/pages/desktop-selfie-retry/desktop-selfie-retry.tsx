import type { IdDocImageUploadError } from '@onefootprint/types';
import {
  IdDocImageProcessingError,
  IdDocImageTypes,
} from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { NavigationHeader } from '../../../../../components';
import DesktopHeader from '../../../components/desktop-header';
import DesktopPhotoPrompt from '../../../components/desktop-photo-prompt';
import Error from '../../../components/error';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../../constants/desktop-interaction-box.constants';
import type { CaptureKind } from '../../../types';
import useDocName from '../../hooks/use-doc-name';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import transformCase from '../../utils/transform-case';

const DesktopSelfieRetry = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.pages.desktop-selfie-retry',
  });
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity, uploadMode, errors, forceUpload } = state.context;
  const { getSideName } = useDocName({
    imageType: IdDocImageTypes.selfie,
  });
  const sideName = getSideName();

  const handleUploadSuccess = (payload: {
    imageFile: File | Blob;
    captureKind: CaptureKind;
    extraCompressed?: boolean;
  }) => {
    send({
      type: 'receivedImage',
      payload,
    });
  };

  const handleUploadError = (errs: IdDocImageUploadError[]) => {
    send({
      type: 'uploadErrored',
      payload: {
        errors: errs.map(err => ({ errorType: err })),
      },
    });
  };
  const handleSelfieRetake = () => {
    send({
      type: 'startImageCapture',
    });
  };

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      {forceUpload ? (
        <DesktopPhotoPrompt
          sideName={sideName}
          hasBadConnectivity={hasBadConnectivity}
          uploadMode={uploadMode}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          errors={
            errors ?? [{ errorType: IdDocImageProcessingError.unknownError }]
          }
          isRetry
          isSelfie
        />
      ) : (
        <Container>
          <DesktopHeader
            sideName={transformCase(sideName, 'first-letter-upper-only')}
            isSelfie
          />
          <ErrorContainer height={DESKTOP_INTERACTION_BOX_HEIGHT}>
            <Error
              errors={
                errors ?? [
                  { errorType: IdDocImageProcessingError.unknownError },
                ]
              }
              sideName={sideName}
            />
          </ErrorContainer>
          <Button fullWidth onClick={handleSelfieRetake} size="large">
            {t('take-selfie-again')}
          </Button>
        </Container>
      )}
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    padding-bottom: ${theme.spacing[5]};
  `}
`;

const ErrorContainer = styled.div<{
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
    padding: 0 ${theme.spacing[6]};
  `}
`;

export default DesktopSelfieRetry;
