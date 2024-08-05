import { IcoClock40 } from '@onefootprint/icons';
import type { CountryCode } from '@onefootprint/types';
import { IdDocImageProcessingError, IdDocImageUploadError } from '@onefootprint/types';
import { Box, Button, Stack, Text, media } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { DocumentRequirement } from '@onefootprint/types/src/api/onboarding-status';
import upperFirst from 'lodash/upperFirst';
import { HeaderTitle } from '../../../../components';
import { getLogger } from '../../../../utils/logger';
import { DESKTOP_INTERACTION_BOX_HEIGHT } from '../../constants';
import useProcessImage from '../../hooks/use-process-image';
import type { CaptureKind, IdDocImageErrorType } from '../../types';
import { getCountryFromCode } from '../../utils/get-country-from-code';
import DesktopHeader from '../desktop-header/desktop-header';
import ErrorComponent from '../error';
import Loading from '../loading';
import DraggableInputField from './components/draggable-input-field';
import handleFileUpload from './utils/handle-file-upload';

const { logError } = getLogger({ location: 'desktop-photo-prompt' });

type DesktopPhotoPromptProps = {
  docName?: string;
  sideName?: string;
  country?: CountryCode;
  isRetry?: boolean;
  errors?: IdDocImageErrorType[];
  hasBadConnectivity?: boolean;
  requirement: DocumentRequirement;
  onUploadSuccess: (arg: {
    imageFile: File | Blob;
    captureKind: CaptureKind;
    extraCompressed?: boolean;
  }) => void;
  onUploadError: (errs: IdDocImageUploadError[]) => void;
  showCameraFallbackText?: boolean;
  isSelfie?: boolean;
};

const DesktopPhotoPrompt = ({
  docName,
  sideName,
  country,
  isRetry,
  errors,
  hasBadConnectivity,
  requirement,
  onUploadSuccess,
  onUploadError,
  showCameraFallbackText,
  isSelfie,
}: DesktopPhotoPromptProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.desktop-photo-prompt',
  });
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const allowPdf = requirement.uploadMode === 'allow_upload';
  const { processImageFile, acceptedFileFormats } = useProcessImage({
    allowPdf,
  });
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onProcessingDone = () => {
    setIsLoading(false);
  };

  const handleError = () => setHasError(true);

  const handleImage = async (file: File) => {
    setIsLoading(true);
    setHasError(false);
    const processResult = await processImageFile(file, hasBadConnectivity);
    if (!processResult) {
      onProcessingDone();
      handleUploadError([IdDocImageUploadError.unknownUploadError]);
      logError('The uploaded image could not be processed due to an unknown error.');
      return;
    }

    onUploadSuccess({
      imageFile: processResult.file,
      captureKind: 'upload',
      extraCompressed: processResult.extraCompressed,
    });
    onProcessingDone();
  };

  const handleUploadError = (errs: IdDocImageUploadError[]) => {
    onUploadError(errs);
  };

  const handleImageUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    handleFileUpload({
      files,
      onSuccess: handleImage,
      onError: handleUploadError,
      allowPdf,
    });
  };

  const countryName = getCountryFromCode(country)?.label;

  const handleUpload = () => {
    uploadPhotoRef.current?.click();
  };

  const onFileInputClick = (ev: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    ev.stopPropagation();
  };

  return (
    <Container>
      <DesktopHeader
        docName={docName ? upperFirst(docName) : docName}
        country={country}
        sideName={sideName ? upperFirst(sideName) : sideName}
        isSelfie={isSelfie}
      />
      <DraggableInputField
        height={DESKTOP_INTERACTION_BOX_HEIGHT}
        onComplete={handleImage}
        isLoading={isLoading}
        hasError={hasError}
        onUploadError={handleUploadError}
        allowPdf={allowPdf}
      >
        {showCameraFallbackText && (
          <>
            <HeaderTitle title={t('camera-fallback-text.title')} icon={IcoClock40} />
            <Text variant="body-2" color="quaternary">
              {t('camera-fallback-text.subtitle')}
            </Text>
          </>
        )}
        {isRetry && (
          <Box paddingLeft={6} paddingRight={6}>
            <ErrorComponent
              errors={errors ?? [{ errorType: IdDocImageProcessingError.unknownError }]}
              sideName={sideName}
              docName={docName}
              countryName={countryName ?? country}
            />
          </Box>
        )}
        {!isRetry && isLoading && <Loading step="process" />}
        {!isRetry && !isLoading && (
          <>
            <Stack>
              <Text variant="label-2" color="accent">
                {t('upload-link-button.title')}
              </Text>
              <Text variant="body-2" color="quaternary">
                &nbsp;{t('drag-drop-text.line-1')}
              </Text>
            </Stack>
            {!allowPdf && (
              <Text variant="body-2" color="quaternary">
                {t('drag-drop-text.line-2')}
              </Text>
            )}
          </>
        )}
        <StyledInput
          ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept={acceptedFileFormats}
          onClick={onFileInputClick}
          onChange={handleImageUpload}
        />
      </DraggableInputField>
      <Button
        fullWidth
        disabled={isLoading}
        onClick={isRetry ? handleUpload : handleError}
        size="large"
        data-dd-action-name={`doc:${isRetry ? 'upload-photo-retry' : 'continue'}`}
      >
        {isRetry ? t('choose-different-file') : t('continue')}
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

const StyledInput = styled.input`
  display: none;
`;

export default DesktopPhotoPrompt;
