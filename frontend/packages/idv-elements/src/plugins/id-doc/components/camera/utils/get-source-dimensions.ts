import type { MutableRefObject } from 'react';

type GetSourceDImensionsProps = {
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  mediaStream: MediaStream | null;
  desiredImageWidth: number;
  desiredImageHeight: number;
};

const getScalingFactor = (
  mediaWidth: number,
  mediaHeight: number,
  clientWidth: number,
  clientHeight: number,
) => {
  // First we find two possible scaling factors
  const k1 = clientWidth / mediaWidth;
  const k2 = clientHeight / mediaHeight;

  // Next we find the how the scaling factors would scale the other dimension (width or height) that was not used to calculate the scaling factor
  const scaledHeightForK1 = mediaHeight * k1;
  const scaleWidthForK2 = mediaWidth * k2;

  // The scaled width and height must be greater or equal to client width and client height
  if (scaledHeightForK1 < clientHeight) return k2;
  if (scaleWidthForK2 < clientWidth) return k1;
  return Math.min(k1, k2);
};

const getSourceDimensions = ({
  videoRef,
  mediaStream,
  desiredImageWidth,
  desiredImageHeight,
}: GetSourceDImensionsProps) => {
  const initialDimensions = {
    sx: 0,
    sy: 0,
    sWidth: 0,
    sHeight: 0,
  };

  if (!videoRef.current || !mediaStream) {
    return initialDimensions;
  }

  const { clientWidth, clientHeight, videoWidth, videoHeight } =
    videoRef.current;

  const { width: mediaWidth, height: mediaHeight } = mediaStream
    .getVideoTracks()[0]
    .getSettings();
  if (!mediaWidth || !mediaHeight) return initialDimensions;

  const scalingFactor = getScalingFactor(
    mediaWidth,
    mediaHeight,
    clientWidth,
    clientHeight,
  );

  // If the aspect ratio of the medaistream isn't same as aspect ratio of the container
  // the CSS rule "object-fit: cover" automatically clips the image to fit the container
  // We find the scaled width and height
  const scaledWidth = mediaWidth * scalingFactor;
  const scaledHeight = mediaHeight * scalingFactor;

  // Now we find the dimensions of the scales height and scaled width after clipping that will be shown in the videoRef
  const sWidth = Math.floor(videoWidth * (desiredImageWidth / scaledWidth));
  const sHeight = Math.floor(videoHeight * (desiredImageHeight / scaledHeight));

  // sx, sy are the coordinates top-left the points on the original video
  // We use the mid-point of the original video, go half the desired image height (scaled) to left
  // and go half the desired image height (scaled) to upward direction
  // and we get our sx, sy
  const sx = Math.floor(
    ((scaledWidth - desiredImageWidth) / 2) * (videoWidth / scaledWidth),
  );
  const sy = Math.floor(
    ((scaledHeight - desiredImageHeight) / 2) * (videoHeight / scaledHeight),
  );

  return {
    sx,
    sy,
    sWidth,
    sHeight,
  };
};

export default getSourceDimensions;
