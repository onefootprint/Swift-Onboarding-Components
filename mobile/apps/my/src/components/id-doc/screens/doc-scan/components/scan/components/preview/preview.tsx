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
import type { ScanSize } from '../../scan.types';
import Errors from './components/errors';
import { DEFAULT_HEIGHT, LARGE_HEIGHT } from './preview.constants';
import encodeImagePath from './utils/encode-image-path';

type PreviewProps = {
  onReset: () => void;
  photo: PhotoFile;
  size?: ScanSize;
  title: string;
  subtitle?: string;
};

const Preview = ({ title, subtitle, onReset, photo, size }: PreviewProps) => {
  const { t } = useTranslation('components.scan.preview');
  const { isLoading, isError, isSuccess, onSubmit, errors, onResetErrors } =
    useContext(ScanContext);
  const showActionButtons = !isError && !isSuccess;
  const imageHeight = size === 'default' ? DEFAULT_HEIGHT : LARGE_HEIGHT;

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
          <Box marginVertical={5}>
            <Typography variant="heading-3" center>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="label-2" center>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box width="100%" height={imageHeight}>
            <PreviewImg
              hasError={isError}
              height={imageHeight}
              size={size}
              source={{ uri: photo.path }}
              width="100%"
            />
          </Box>
          {isError && <Errors errors={errors} />}
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

const PreviewImg = styled(Image)<{ hasError: boolean; size: ScanSize }>`
  ${({ theme, size, hasError }) => css`
    border-radius: ${theme.borderRadius.large};
    height: ${size === 'default' ? DEFAULT_HEIGHT : LARGE_HEIGHT}px;
    margin-top: ${theme.spacing[7]};
    width: 100%;

    ${hasError &&
    css`
      border-width: ${theme.borderWidth[3]};
      border-color: ${theme.borderColor.error};
    `}
  `}
`;

export default Preview;
