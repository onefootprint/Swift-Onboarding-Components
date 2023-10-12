import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type {
  CountryCode,
  IdDocImageTypes,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import {
  IdDocImageProcessingError,
  IdDocImageUploadError,
} from '@onefootprint/types';
import { Box, Button, media, Stack, Typography } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';

import StickyBottomBox from '../../../../components/layout/components/sticky-bottom-box';
import Logger from '../../../../utils/logger';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../constants/desktop-interaction-box.constants';
import useProcessImage from '../../hooks/use-process-image';
import { getCountryFromCode } from '../../utils/get-country-from-code';
import type { IdDocImageErrorType } from '../../utils/state-machine';
import DesktopHeader from '../desktop-header/desktop-header';
import Error from '../error';
import Loading from '../loading';
import { useIdDocMachine } from '../machine-provider';
import DraggableInputField from './components/draggable-input-field';
import handleFileUpload from './utils/handle-file-upload';

type DesktopPhotoPromptProps = {
  type: SupportedIdDocTypes;
  imageType: IdDocImageTypes;
  country: CountryCode;
  isRetry?: boolean;
  errors?: IdDocImageErrorType[];
};

const DesktopPhotoPrompt = ({
  type,
  imageType,
  country,
  isRetry,
  errors,
}: DesktopPhotoPromptProps) => {
  const { t } = useTranslation('components.desktop-photo-prompt');
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity } = state.context;
  const uploadPhotoRef = useRef<HTMLInputElement | undefined>();
  const { processImageFile } = useProcessImage();
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
      console.error(
        'Image upload failed on desktop mode. Uploaded image could not be processed',
      );
      Logger.error(
        'Image upload failed on desktop mode. Uploaded image could not be processed',
        'desktop-photo-prompt',
      );
      return;
    }

    send({
      type: 'receivedImage',
      payload: {
        imageFile: processResult.file,
        extraCompressed: processResult.extraCompressed,
      },
    });
    onProcessingDone();
  };

  const handleUploadError = (errs: IdDocImageUploadError[]) => {
    send({
      type: 'uploadErrored',
      payload: {
        errors: errs.map(err => ({ errorType: err })),
      },
    });
  };

  const handleImageUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    handleFileUpload({
      files,
      onSuccess: handleImage,
      onError: handleUploadError,
    });
  };

  const countryName = getCountryFromCode(country)?.label;

  const handleUpload = () => {
    uploadPhotoRef.current?.click();
  };

  const onFileInputClick = (
    ev: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    ev.stopPropagation();
  };

  return (
    <Container>
      <DesktopHeader type={type} country={country} imageType={imageType} />
      <DraggableInputField
        height={DESKTOP_INTERACTION_BOX_HEIGHT}
        onComplete={handleImage}
        isLoading={isLoading}
        hasError={hasError}
        onUploadError={handleUploadError}
      >
        {isRetry && (
          <Box paddingLeft={6} paddingRight={6}>
            <Error
              errors={
                errors ?? [
                  { errorType: IdDocImageProcessingError.unknownError },
                ]
              }
              imageType={imageType}
              docType={type}
              countryName={countryName ?? country}
              backgroundColor="secondary"
            />
          </Box>
        )}
        {!isRetry && isLoading && (
          <Loading step="process" imageType={imageType} />
        )}
        {!isRetry && !isLoading && (
          <>
            <Stack>
              <Typography variant="label-2" color="accent">
                {t('upload-link-button.title')}
              </Typography>
              <Typography variant="body-2" sx={{ color: 'quaternary' }}>
                &nbsp;{t('drag-drop-text.line-1')}
              </Typography>
            </Stack>
            <Typography variant="body-2" sx={{ color: 'quaternary' }}>
              {t('drag-drop-text.line-2')}
            </Typography>
          </>
        )}
        <StyledInput
          ref={uploadPhotoRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="image/*,.heic,.heif"
          onClick={onFileInputClick}
          onChange={handleImageUpload}
        />
      </DraggableInputField>
      <StickyBottomBox>
        <Button
          fullWidth
          disabled={isLoading}
          onClick={isRetry ? handleUpload : handleError}
        >
          {isRetry ? t('choose-different-file') : t('continue')}
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

const StyledInput = styled.input`
  display: none;
`;

export default DesktopPhotoPrompt;
