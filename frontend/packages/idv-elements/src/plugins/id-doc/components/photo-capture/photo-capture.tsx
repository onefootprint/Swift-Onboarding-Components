import { IcoInfo24 } from '@onefootprint/icons';
import type { IdDocImageTypes } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React, { useEffect, useLayoutEffect, useState } from 'react';

import type { NavigationHeaderLeftButtonProps } from '../../../../components';
import {
  HeaderTitle,
  NavigationHeader,
  useLayoutOptions,
} from '../../../../components';
import Logger from '../../../../utils/logger';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useProcessImage from '../../hooks/use-process-image';
import { isDesktop, isDocument, isFace, isMobile } from '../../utils/capture';
import type { CaptureKind } from '../../utils/state-machine';
import Camera from '../camera';
import AutoCaptureDoc from '../camera/auto-capture-doc';
import AutoCaptureFace from '../camera/auto-capture-face';
import type {
  AutocaptureKind,
  CaptureStatus,
  DeviceKind,
} from '../camera/types';
import type { CameraKind } from '../camera/utils/get-camera-options';
import Loading from '../loading';
import Preview from '../preview';
import Instructions from './components/instructions';

type HeaderTextType = { camera: string; preview: string };
type OnComplete = (
  imageFile: File | Blob,
  extraCompressed: boolean,
  captureKind: CaptureKind,
) => void;

type PhotoCaptureProps = {
  autocaptureKind: AutocaptureKind;
  cameraKind: CameraKind;
  deviceKind: DeviceKind;
  imageType: IdDocImageTypes;
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

const MobileBoxSX: ComponentProps<typeof Box>['sx'] = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
};

const logWarn = (e: string) => Logger.warn(e, 'photo-capture');

const PhotoCapture = ({
  autocaptureKind,
  cameraKind,
  deviceKind,
  imageType,
  onBack,
  onComplete,
  outlineHeightRatio,
  outlineWidthRatio,
  subtitle,
  title,
}: PhotoCaptureProps) => {
  const [state, send] = useIdDocMachine();
  const {
    hasBadConnectivity,
    idDoc: { type: docType },
  } = state.context;
  const { processImageUrl } = useProcessImage();
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captureKind, setCaptureKind] = useState<CaptureKind>();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [autocaptureFeedback, setAutocaptureFeedback] = useState<
    CaptureStatus | undefined
  >('detecting');
  const {
    footer: { set: updateFooter },
  } = useLayoutOptions();

  useLayoutEffect(() => {
    if (isMobile(deviceKind)) {
      return () => {};
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
      logWarn(
        'Captured image could not be confirmed and submitted - retaking the image',
      );
      return;
    }

    if (!captureKind) {
      logWarn('Captured kind could not be determined - retaking the image');
      return;
    }
    Logger.info(`Photocapture: image URL length ${image.length}`);

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
    Logger.info(
      `Photocapture: size of the processed file to be sent in machine event type 'receivedImage' is ${file.size}, file type ${file.type}`,
    );
    onComplete(file, extraCompressed, captureKind);
  };

  const handleError = () => {
    send({ type: 'cameraErrored' });
  };

  useEffect(() => {
    if (image && isMobile(deviceKind)) handleConfirm();
  }, [image]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCapture = (newImage: string, newCaptureKind: CaptureKind) => {
    setImage(newImage);
    setCaptureKind(newCaptureKind);
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
        <Box sx={MobileBoxSX}>
          <Loading step="process" imageType={imageType} />
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
        cameraKind={cameraKind}
        deviceKind={deviceKind}
        docType={docType}
        imageType={imageType}
        onCapture={handleCapture}
        onError={isMobile(deviceKind) ? handleError : undefined} // We just show a toast in desktop since we don't have a prompt page
        outlineHeightRatio={outlineHeightRatio}
        outlineWidthRatio={outlineWidthRatio}
        setIsCaptured={setIsCaptured}
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
