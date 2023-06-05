import { MutableRefObject } from 'react';

type GetSourceDImensionsProps = {
  videoRef: MutableRefObject<HTMLVideoElement | undefined>;
  desiredImageWidth: number;
  desiredImageHeight: number;
};

const getSourceDimensions = ({
  videoRef,
  desiredImageWidth,
  desiredImageHeight,
}: GetSourceDImensionsProps) => {
  if (!videoRef || !videoRef.current) {
    return {
      sx: 0,
      sy: 0,
      sWidth: 0,
      sHeight: 0,
    };
  }

  const { clientWidth, videoWidth, videoHeight } = videoRef.current;

  // If the aspect ratio of the image isn't same as aspect ratio of the container
  // the CSS rule "object-fit: cover" automatically clips the image to fit the container
  // Since the image will always have higher height than width in portrait mode
  // we assume that we never have to clip the image along the width
  const scaledWidth = clientWidth;

  // We however may cut off the top and bottom parts of the image vertically
  // and only show the middle part of the image that fits the container
  const sWidth = videoWidth * (desiredImageWidth / scaledWidth);

  const scaledHeight = (videoHeight / videoWidth) * clientWidth;
  const sHeight = videoHeight * (desiredImageHeight / scaledHeight);

  // sx, sy are the coordinates top-left the points on the original video
  // We use the mid-point of the original video, go half the desired image height (scaled) to left
  // and go half the desired image height (scaled) to upward direction
  // and we get our sx, sy
  const sx =
    ((scaledWidth - desiredImageWidth) / 2) * (videoWidth / scaledWidth);
  const sy =
    ((scaledHeight - desiredImageHeight) / 2) * (videoHeight / scaledHeight);

  return {
    sx,
    sy,
    sWidth,
    sHeight,
  };
};

export default getSourceDimensions;
