import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Button,
  Container,
  FeedbackButton,
  Image,
  Typography,
} from '@onefootprint/ui';
import React, { useContext } from 'react';
import { StatusBar } from 'react-native';
import { PhotoFile } from 'react-native-vision-camera';

import useTranslation from '@/hooks/use-translation';

import ScanContext from '../../../scan-context';
import Errors from './components/errors';
import encodeImagePath from './utils/encode-image-path';

type PreviewProps = {
  onReset: () => void;
  photo: PhotoFile;
  title: string;
};

const Camera = ({ title, onReset, photo }: PreviewProps) => {
  const { t } = useTranslation('components.scan.preview');
  const { isLoading, isError, isSuccess, onSubmit, errors, onResetErrors } =
    useContext(ScanContext);
  const showActionButtons = !isError && !isSuccess;

  const handleSubmit = async () => {
    if (!photo) return;
    const encodedImage = await encodeImagePath(photo.path);
    onSubmit(encodedImage);
  };

  const handleRetakeAfterError = () => {
    onResetErrors();
    onReset();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Container>
        <Box flex={1}>
          <Box>
            <Typography marginVertical={5} variant="heading-3" center>
              {title}
            </Typography>
            <Preview
              hasError={isError}
              resizeMode="cover"
              source={{ uri: photo.path }}
            />
            {isError && <Errors errors={errors} />}
          </Box>
        </Box>
        <Box gap={4}>
          {isSuccess && (
            <>
              <FeedbackButton>{t('cta-success')}</FeedbackButton>
              <Button disabled variant="secondary">
                {t('retake')}
              </Button>
            </>
          )}
          {isError && (
            <Button disabled={isLoading} onPress={handleRetakeAfterError}>
              {t('retake')}
            </Button>
          )}
          {showActionButtons && (
            <>
              <Button
                onPress={handleSubmit}
                loading={isLoading}
                loadingLabel={t('cta-loading')}
              >
                {t('cta')}
              </Button>
              <Button
                disabled={isLoading}
                variant="secondary"
                onPress={onReset}
              >
                {t('retake')}
              </Button>
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

const Preview = styled(Image)<{ hasError: boolean }>`
  ${({ theme, hasError }) => css`
    border-radius: ${theme.borderRadius.large};
    height: 390px;
    margin-top: ${theme.spacing[7]};
    width: 100%;

    ${hasError &&
    css`
      border-width: ${theme.borderWidth[3]};
      border-color: ${theme.borderColor.error};
    `}
  `}
`;

export default Camera;
