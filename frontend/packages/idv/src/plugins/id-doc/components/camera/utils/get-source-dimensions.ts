import type { VideoRef } from '../types';

type GetSourceDImensionsProps = {
  videoRef: VideoRef;
  mediaStream: MediaStream | null;
  desiredImageWidth: number;
  desiredImageHeight: number;
  centerOffsetX?: number;
  centerOffsetY?: number;
};

const ERROR_MARGIN = -10; // to avoid rouding error

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
  centerOffsetX = 0,
  centerOffsetY = 0,
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

  // Now we find the dimensions of the scaled height and scaled width after clipping that will be shown in the videoRef
  const sWidth = Math.floor(videoWidth * (desiredImageWidth / scaledWidth));
  const sHeight = Math.floor(videoHeight * (desiredImageHeight / scaledHeight));

  // sx, sy are the coordinates top-left the points on the original video
  // We use the mid-point of the original video, go half the desired image height (scaled) to left
  // and go half the desired image height (scaled) to upward direction
  // and we get our sx, sy
  let sx = Math.ceil(
    ((scaledWidth - desiredImageWidth) / 2 + centerOffsetX) *
      (videoWidth / scaledWidth),
  );
  let sy = Math.ceil(
    ((scaledHeight - desiredImageHeight) / 2 + centerOffsetY) *
      (videoHeight / scaledHeight),
  );

  // Just in case any fractional calculation yielded small negative numbers
  if (sx < ERROR_MARGIN) sx = 0;
  if (sy < ERROR_MARGIN) sy = 0;

  return {
    sx,
    sy,
    sWidth,
    sHeight,
  };
};

export default getSourceDimensions;
