import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Button,
  FeedbackButton,
  Image,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { StatusBar } from 'react-native';

import BackButton from '@/components/back-button';
import Header from '@/components/header';
import ScrollLayout from '@/components/scroll-layout';
import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

import { useScanContext } from '../../../scan-context';
import type { ScanPicture, ScanSize } from '../../scan.types';
import Errors from './components/errors';
import { DEFAULT_HEIGHT, LARGE_HEIGHT } from './preview.constants';
import sanitizeImagePath from './utils/sanitize-image-path';

type PreviewProps = {
  onBack?: () => void;
  onReset: () => void;
  picture: ScanPicture;
  size?: ScanSize;
  subtitle?: string;
  title: string;
};

const Preview = ({
  onBack,
  onReset,
  picture,
  size,
  subtitle,
  title,
}: PreviewProps) => {
  const { t } = useTranslation('components.scan.preview');
  const { isLoading, isError, errors, isSuccess, onSubmit, onResetErrors } =
    useScanContext();
  const showActionButtons = !isError && !isSuccess;
  const imageHeight = size === 'default' ? DEFAULT_HEIGHT : LARGE_HEIGHT;
  const analytics = useAnalytics();

  const handleSubmit = async () => {
    if (!picture.photo) return;
    onSubmit(picture.photo, picture.meta);
  };

  const handleRetakeAfterError = () => {
    analytics.track(Events.DocUploadRestarted);
    onResetErrors();
    onReset();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollLayout
        Footer={
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
        }
      >
        <Header headerLeft={<BackButton onPress={onBack} />} />
        <Box marginTop={5} marginBottom={1}>
          <Typography variant="heading-3" center>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="label-2" center>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box height={imageHeight} marginBottom={7}>
          <PreviewImg
            hasError={isError}
            height={imageHeight}
            size={size}
            source={{ uri: sanitizeImagePath(picture.photo.path) }}
          />
        </Box>
        {isError && <Errors errors={errors} />}
      </ScrollLayout>
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
