import cv, {
  Mat,
  MatVector,
  Point,
  Rect,
  RotatedRect,
} from '@onefootprint/opencv-ts';

import { ParamsType } from './params';

// The threshold value used for finding contours.
// If the pixel value is less than the threshold, it will be set to 0
// If the pixel value exceeds the threshold, it will be assigned the max value
const contouringThreshold = 177;
const contouringMaxPixelVal = 200; // The value that will be assigned to the pixels that exceed threshold value

export enum CardCaptureStatus {
  OK = 'ok',
  detecting = 'detecting',
}

export const getMedianBlur = (
  src: Mat,
  kSize: number,
  shouldCleanUp: Boolean,
) => {
  const dst = new cv.Mat();
  cv.medianBlur(src, dst, kSize); // Kernel with size 9x9 worked best during testing

  // cleanup
  if (shouldCleanUp) src.delete();
  return dst;
};

export const getEdges = (
  src: Mat,
  firstThreshold: number,
  secondThreshold: number,
  apertureSize: number,
  shouldCleanUp: boolean,
) => {
  const dst = new cv.Mat();
  cv.Canny(src, dst, firstThreshold, secondThreshold, apertureSize);

  // cleanup
  if (shouldCleanUp) src.delete();

  return dst;
};

export const getDilatedImage = (src: Mat, shouldCleanUp: boolean) => {
  const dst = new cv.Mat();
  const Ones = cv.Mat.ones;
  const numRowsAndCols = 5; // number of rows and cols in the kernel matrix
  const M = new Ones(numRowsAndCols, numRowsAndCols, cv.CV_8U);
  const anchor = new cv.Point(-1, -1); // anchor position (-1, -1) means that the anchor is at the center
  const numIterations = 1;
  cv.dilate(
    src,
    dst,
    M,
    anchor,
    numIterations,
    cv.BORDER_CONSTANT,
    cv.morphologyDefaultBorderValue(),
  );

  // cleanup
  if (shouldCleanUp) {
    src.delete();
    M.delete();
  }

  return dst;
};

export const getExternalContours = (src: Mat, shouldCleanUp: boolean) => {
  cv.threshold(
    src,
    src,
    contouringThreshold,
    contouringMaxPixelVal,
    cv.THRESH_BINARY,
  );
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(
    src,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE,
  );

  // cleanup
  if (shouldCleanUp) {
    src.delete();
    hierarchy.delete();
  }

  return contours;
};

export const getBoundingBoxes = (contours: MatVector) => {
  const boundingBoxes: { minAreaRect: RotatedRect; uprightRect: Rect }[] = [];
  const totalContours = contours.size();

  for (let i = 0; i < totalContours; i += 1) {
    const contour = contours.get(i);
    const minAreaRect = cv.minAreaRect(contour);
    const uprightRect = cv.boundingRect(contour);
    boundingBoxes.push({ minAreaRect, uprightRect });
  }

  return boundingBoxes;
};

// The width (in horizontal direction) must be greater the height
// and the card cannot be too much tilted
export const getIsHorizontallyAligned = ({
  minAreaRect,
  uprightRect,
}: {
  minAreaRect: RotatedRect;
  uprightRect: Rect;
}) => {
  const uprightWidth = uprightRect.width;
  const uprightHeight = uprightRect.height;
  const uprightArea = uprightWidth * uprightHeight;

  const { width: minAreaWidth, height: minAreaHeight } = minAreaRect.size;
  const minArea = minAreaWidth * minAreaHeight;

  if (uprightHeight > uprightWidth) {
    return false;
  }

  // The differences between the area cannot be more than 10% (play around with this value)
  const diff = (Math.abs(uprightArea - minArea) * 100) / minArea;

  if (diff > 10) {
    return false;
  }

  return true;
};

export const coversOutlineSpace = (
  uprightRect: Rect,
  outlineWidth: number,
  outlineHeight: number,
) => {
  const uprightWidth = uprightRect.width;
  const uprightHeight = uprightRect.height;

  // 30% error margin for width
  // 70% error margin for height
  // the height error margin is higher because backside on the US driver's licenses has a black stripe on it which reduces the contour height
  const isWideEnough =
    (Math.abs(uprightWidth - outlineWidth) * 100) / uprightWidth < 30;
  const isHighEnough =
    (Math.abs(uprightHeight - outlineHeight) * 100) / uprightHeight < 70;

  return (
    isWideEnough &&
    isHighEnough &&
    outlineWidth > uprightWidth &&
    outlineHeight > uprightHeight
  );
};

// If the card is over aligned, we probably misclassified something else as a card
export const isOverAligned = ({
  topLeft,
  bottomRight,
  imgWidth,
  imgHeight,
}: {
  topLeft: Point;
  bottomRight: Point;
  imgWidth: number;
  imgHeight: number;
}) => {
  // Does the left line of the bounding box aligns exactly with left edge of the image
  if (topLeft.x === 0) return true;

  // Does the top line of the bounding box aligns exactly with top edge of the image
  if (topLeft.y === 0) return true;

  // Does the right line of the bounding box aligns exactly with right edge of the image
  if (bottomRight.x === imgWidth) return true;

  // Does the bottom line of the bounding box aligns exactly with bottom edge of the image
  if (bottomRight.y === imgHeight) return true;

  return false;
};

export const detectCardStatus = (
  src: Mat,
  imgWidth: number,
  imgHeight: number,
  params: ParamsType[],
) => {
  for (let i = 0; i < params.length; i += 1) {
    const { kSize, fThresh, sThresh, aperSize } = params[i];
    const medianBlurredImage = getMedianBlur(src, kSize, false); // should not clean the src since we need it for every iteration of the loop
    const edges = getEdges(
      medianBlurredImage,
      fThresh,
      sThresh,
      aperSize,
      true,
    );
    const dilatedEdges = getDilatedImage(edges, true);
    const contours = getExternalContours(dilatedEdges, true);
    const boundingBoxes = getBoundingBoxes(contours);
    const possibleCards: { minAreaRect: RotatedRect; uprightRect: Rect }[] = [];
    boundingBoxes.forEach(boundingBox => {
      const topLeft = new cv.Point(
        boundingBox.uprightRect.x,
        boundingBox.uprightRect.y,
      );
      const bottomRight = new cv.Point(
        boundingBox.uprightRect.x + boundingBox.uprightRect.width,
        boundingBox.uprightRect.y + boundingBox.uprightRect.height,
      );
      if (
        getIsHorizontallyAligned(boundingBox) &&
        coversOutlineSpace(boundingBox.uprightRect, imgWidth, imgHeight) &&
        !isOverAligned({
          topLeft,
          bottomRight,
          imgWidth,
          imgHeight,
        })
      ) {
        possibleCards.push(boundingBox);
      }
    });
    contours.delete();
    if (possibleCards.length === 1) {
      src.delete(); // now we can clean the src
      return { status: CardCaptureStatus.OK, paramIndex: i };
    }
  }
  src.delete(); // now we can clean the src
  return { status: CardCaptureStatus.detecting, paramIndex: -1 };
};

export const getCardCaptureStatus = (
  imgSrc: HTMLImageElement | HTMLCanvasElement,
  params: ParamsType[],
) => {
  if (!cv.Mat) return { status: CardCaptureStatus.detecting, paramIndex: -1 }; // If (until) opencv is not initialized, we don't do anything and rely of manual capture fallback
  if (imgSrc.width === 0 || imgSrc.height === 0)
    return { status: CardCaptureStatus.detecting, paramIndex: -1 };
  const src = cv.imread(imgSrc);
  return detectCardStatus(src, imgSrc.width, imgSrc.height, params);
};
