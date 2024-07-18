import { IcoInfo24 } from '@onefootprint/icons';
import type { DocumentUploadMode } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React, { useEffect, useLayoutEffect, useState } from 'react';

import type { NavigationHeaderLeftButtonProps } from '../../../../components';
import { HeaderTitle, NavigationHeader, useLayoutOptions } from '../../../../components';
import { getLogger } from '../../../../utils/logger';
import useProcessImage from '../../hooks/use-process-image';
import type { CaptureKind } from '../../types';
import { bytesToMegabytes, isDesktop, isDocument, isFace, isMobile } from '../../utils/capture';
import Camera from '../camera';
import AutoCaptureDoc from '../camera/auto-capture-doc';
import AutoCaptureFace from '../camera/auto-capture-face';
import type { AutocaptureKind, CaptureStatus, DeviceKind } from '../camera/types';
import type { CameraSide } from '../camera/utils/get-camera-options';
import Loading from '../loading';
import Instructions from './components/instructions';
import Preview from './components/preview';

type HeaderTextType = { camera: string; preview: string };
type OnComplete = (imageFile: File | Blob, extraCompressed: boolean, captureKind: CaptureKind) => void;

type PhotoCaptureProps = {
  autocaptureKind: AutocaptureKind;
  cameraKind: CameraSide;
  deviceKind: DeviceKind;
  sideName?: string;
  docName?: string;
  orgId: string;
  uploadMode: DocumentUploadMode;
  hasBadConnectivity?: boolean;
  onCameraStuck?: () => void;
  onCameraErrored?: () => void;
  onBack?: () => void;
  onComplete: OnComplete;
  outlineHeightRatio: number; // with respect to the video width (not height)
  outlineWidthRatio: number; // with respect to the video width
  subtitle?: Partial<HeaderTextType>;
  title: HeaderTextType;
};

const DesktopNavProps: NavigationHeaderLeftButtonProps = {
  variant: 'close',
  confirmClose: true,
};

const { logWarn, logInfo } = getLogger({ location: 'photo-capture' });

const PhotoCapture = ({
  autocaptureKind,
  cameraKind,
  deviceKind,
  sideName,
  docName,
  orgId,
  uploadMode,
  hasBadConnectivity,
  onCameraStuck,
  onCameraErrored,
  onBack,
  onComplete,
  outlineHeightRatio,
  outlineWidthRatio,
  subtitle,
  title,
}: PhotoCaptureProps) => {
  const allowPdf = uploadMode === 'allow_upload';
  const allowUpload = uploadMode !== 'capture_only';
  const { processImageUrl } = useProcessImage({ allowPdf });
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captureKind, setCaptureKind] = useState<CaptureKind>();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [autocaptureFeedback, setAutocaptureFeedback] = useState<CaptureStatus | undefined>('detecting');
  const {
    footer: { set: updateFooter },
  } = useLayoutOptions();
  const { FallbackToDocUploadOnCameraError } = useFlags();
  const orgIds = new Set<string>(FallbackToDocUploadOnCameraError);
  const shouldFallbackToUpload = orgIds.has(orgId);

  useLayoutEffect(() => {
    if (isMobile(deviceKind)) {
      return () => undefined;
    }
    // Only hide footer when we are in camera mode
    if (image) {
      updateFooter({ visible: true });
    } else {
      updateFooter({ visible: false });
    }

    return () => {
      // Reset footer visibility when unmounting just in case
      updateFooter({ visible: true });
    };
  }, [image, deviceKind, updateFooter]);

  const handleRetake = () => {
    setImage(null);
    setIsCaptured(false);
  };

  const handleConfirm = async () => {
    if (!image) {
      logWarn('Captured image could not be confirmed and submitted - retaking the image');
      return;
    }

    if (!captureKind) {
      logWarn('Captured kind could not be determined - retaking the image');
      return;
    }
    logInfo(`Photocapture: image URL length ${bytesToMegabytes(image.length)} MB`);

    setIsLoading(true);
    const processResult = await processImageUrl(image, hasBadConnectivity);
    if (!processResult) {
      // An error occurred, directly prompt user to re-take the image
      setIsLoading(false);
      handleRetake();
      logWarn('Captured image could not be processed - retaking the image');
      return;
    }

    setIsLoading(false);
    const { file, extraCompressed } = processResult;
    logInfo(
      `Photocapture: size of the processed file to be sent in machine event type 'receivedImage' is ${bytesToMegabytes(file.size)} MB, file type ${file.type}`,
    );
    onComplete(file, extraCompressed, captureKind);
  };

  const handleError = (_err?: unknown) => {
    onCameraErrored?.();
  };

  useEffect(() => {
    if (image && isMobile(deviceKind)) handleConfirm();
  }, [image]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCapture = (newImage: string, newCaptureKind: CaptureKind) => {
    setImage(newImage);
    setCaptureKind(newCaptureKind);
  };

  const handleCameraStuck = () => {
    if (shouldFallbackToUpload) {
      onCameraStuck?.();
      logInfo('Photocapture: Camera stuck, fallback to doc upload');
    }
  };

  return image ? (
    <>
      {isDesktop(deviceKind) && (
        <>
          <Box marginBottom={7}>
            <NavigationHeader leftButton={DesktopNavProps} />
            <HeaderTitle title={title.preview} />
          </Box>
          <Preview
            imageSrc={image}
            onRetake={handleRetake}
            onConfirm={handleConfirm}
            isLoading={isLoading}
            cameraKind={cameraKind}
            deviceKind={deviceKind}
          />
        </>
      )}
      {isMobile(deviceKind) && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <Loading step="process" />
        </Box>
      )}
    </>
  ) : (
    <>
      {isDesktop(deviceKind) && (
        <Box marginBottom={7}>
          <NavigationHeader leftButton={DesktopNavProps} />
          <HeaderTitle title={title.camera} subtitle={subtitle?.camera} />
        </Box>
      )}
      {isMobile(deviceKind) && (
        <NavigationHeader
          leftButton={{ variant: 'back', onBack }}
          rightButton={{
            icon: IcoInfo24,
            onClick: () => setShowInstructions(true),
          }}
          content={{ kind: 'static', title: title.camera }}
        />
      )}
      <Camera
        autocaptureFeedback={autocaptureFeedback}
        autocaptureKind={autocaptureKind}
        cameraSide={cameraKind}
        deviceKind={deviceKind}
        docName={docName}
        sideName={sideName}
        onCapture={handleCapture}
        onUpload={onComplete}
        hasBadConnectivity={hasBadConnectivity}
        onError={isMobile(deviceKind) ? handleError : undefined} // We just show a toast in desktop since we don't have a prompt page
        outlineHeightRatio={outlineHeightRatio}
        outlineWidthRatio={outlineWidthRatio}
        setIsCaptured={setIsCaptured}
        allowPdf={allowPdf}
        onCameraStuck={handleCameraStuck}
        allowUpload={allowUpload}
      >
        {({
          canvasAutoCaptureRef,
          feedbackPositionFromBottom,
          mediaStream,
          onDetectionComplete,
          onDetectionReset,
          outlineHeight,
          outlineWidth,
          videoRef,
          videoSize,
        }) => {
          if (isDocument(autocaptureKind)) {
            return (
              <AutoCaptureDoc
                canvasAutoCaptureRef={canvasAutoCaptureRef}
                feedbackPositionFromBottom={feedbackPositionFromBottom}
                isCaptured={isCaptured}
                mediaStream={mediaStream}
                onDetectionComplete={onDetectionComplete}
                onDetectionReset={onDetectionReset}
                outlineHeight={outlineHeight}
                outlineWidth={outlineWidth}
                setAutocaptureFeedback={setAutocaptureFeedback}
                videoRef={videoRef}
                videoSize={videoSize}
              />
            );
          }

          return isFace(autocaptureKind) ? (
            <AutoCaptureFace
              canvasAutoCaptureRef={canvasAutoCaptureRef}
              feedbackPositionFromBottom={feedbackPositionFromBottom}
              isCaptured={isCaptured}
              onDetectionComplete={onDetectionComplete}
              onDetectionReset={onDetectionReset}
              outlineWidth={outlineWidth}
              setAutocaptureFeedback={setAutocaptureFeedback}
              videoRef={videoRef}
              videoSize={videoSize}
            />
          ) : null;
        }}
      </Camera>
      <Instructions
        onClose={() => setShowInstructions(false)}
        isOpen={showInstructions}
        autocaptureKind={autocaptureKind}
      />
    </>
  );
};

export default PhotoCapture;
