const MAX_HEAD_ROLL = 10;
const MAX_HEAD_PITCH = 10;
const MAX_HEAD_YAW = 40;

// The roll, pitch, and yaw returned by the face API are used to find head direction
// These angles are hard to explain in texts, easier to understand from pictures
// But here are the definitions from an aviation website:
// Rotation around the front-to-back axis is called roll.
// Rotation around the side-to-side axis is called pitch.
// Rotation around the vertical axis is called yaw.
export const isHeadStraight = (angle: {
  roll: number | undefined;
  pitch: number | undefined;
  yaw: number | undefined;
}) => {
  const { roll, pitch, yaw } = angle;
  if (roll === undefined || pitch === undefined || yaw === undefined)
    return false;
  if (Math.abs(roll) > MAX_HEAD_ROLL) return false;
  if (Math.abs(pitch) > MAX_HEAD_PITCH) return false;
  if (Math.abs(yaw) > MAX_HEAD_YAW) return false;
  return true;
};

// If the face is too small, we consider it's far (normal optics) and vice versa
export const isFaceCloseEnough = (dimensions: {
  frameWidth: number;
  frameHeight: number;
  faceWidth: number;
  faceHeight: number;
}) => {
  const { frameWidth, frameHeight, faceWidth, faceHeight } = dimensions;
  if (!frameWidth || !frameHeight || !faceWidth || !faceHeight) return false;
  if (faceWidth < 0.5 * frameWidth && faceHeight < 0.5 * frameHeight)
    return false;
  return true;
};

// Nothing fancy
// We simply assume that the frame outline is centered in the video
// And we find the left, right, top, bottom given the width and height of the frame and the video
// Face API already gives us the face location and dimensions
export const isFaceInTheFrame = (dimensions: {
  videoWidth: number;
  videoHeight: number;
  frameWidth: number;
  frameHeight: number;
  faceWidth: number;
  faceHeight: number;
  faceX: number;
  faceY: number;
}) => {
  const {
    videoWidth,
    videoHeight,
    frameWidth,
    frameHeight,
    faceWidth,
    faceHeight,
    faceX,
    faceY,
  } = dimensions;

  const faceLeft = faceX;
  const faceRight = faceX + faceWidth;
  const faceTop = faceY;
  const faceBottom = faceY + faceHeight;

  const frameLeft = Math.abs(videoWidth - frameWidth) / 2;
  const frameRight = frameLeft + frameWidth;
  const frameTop = Math.abs(videoHeight - frameHeight) / 2;
  const frameBottom = frameTop + frameHeight;

  const leftOffset = faceLeft - frameLeft;
  const rightOffset = frameRight - faceRight;
  const topOffset = faceTop - frameTop;
  const bottomOffset = frameBottom - faceBottom;

  // 5% error margin
  if (leftOffset < 0 && Math.abs((leftOffset * 100) / faceWidth) > 5)
    return false;
  if (rightOffset < 0 && Math.abs((rightOffset * 100) / faceWidth) > 5)
    return false;
  if (topOffset < 0 && Math.abs((topOffset * 100) / faceHeight) > 5)
    return false;
  if (bottomOffset < 0 && Math.abs((bottomOffset * 100) / faceHeight) > 5)
    return false;

  return true;
};
