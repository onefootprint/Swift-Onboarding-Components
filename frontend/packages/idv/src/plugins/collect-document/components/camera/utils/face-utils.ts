import type { FaceLandmarks68, Point } from 'face-api.js';

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
  if (roll === undefined || pitch === undefined || yaw === undefined) return false;
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
  if (faceWidth < 0.5 * frameWidth && faceHeight < 0.5 * frameHeight) return false;
  return true;
};

// Nothing fancy
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
  frameOffsetX: number;
  frameOffsetY: number;
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
    frameOffsetX,
    frameOffsetY,
  } = dimensions;

  const faceLeft = faceX;
  const faceRight = faceX + faceWidth;
  const faceTop = faceY;
  const faceBottom = faceY + faceHeight;

  const frameLeft = Math.abs(videoWidth - frameWidth) / 2 + frameOffsetX;
  const frameRight = frameLeft + frameWidth;
  const frameTop = Math.abs(videoHeight - frameHeight) / 2 + frameOffsetY;
  const frameBottom = frameTop + frameHeight;

  const leftOffset = faceLeft - frameLeft;
  const rightOffset = frameRight - faceRight;
  const topOffset = faceTop - frameTop;
  const bottomOffset = frameBottom - faceBottom;

  // 5% error margin
  if (leftOffset < 0 && Math.abs((leftOffset * 100) / faceWidth) > 5) return false;
  if (rightOffset < 0 && Math.abs((rightOffset * 100) / faceWidth) > 5) return false;
  if (topOffset < 0 && Math.abs((topOffset * 100) / faceHeight) > 5) return false;
  if (bottomOffset < 0 && Math.abs((bottomOffset * 100) / faceHeight) > 5) return false;

  return true;
};

export const calculateFaceAngle = (mesh: FaceLandmarks68) => {
  // Helper to convert radians to degrees
  const degrees = (radians: number) => (radians * 180) / Math.PI;
  const calcLengthBetweenTwoPoints = (a: Point | { x: number; y: number }, b: Point | { x: number; y: number }) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const angle = {
    roll: <number | undefined>undefined,
    pitch: <number | undefined>undefined,
    yaw: <number | undefined>undefined,
  };

  const calcYaw = (leftPoint: Point, midPoint: Point, rightPoint: Point) => {
    // Calc x-distance from left side of the face ("ear") to facial midpoint ("nose")
    const leftToMidpoint = Math.floor(leftPoint.x - midPoint.x);
    // Calc x-distance from facial midpoint ("nose") to the right side of the face ("ear")
    const rightToMidpoint = Math.floor(midPoint.x - rightPoint.x);
    // Difference in distances coincidentally approximates to angles
    return leftToMidpoint - rightToMidpoint;
  };

  const calcRoll = (lever: Point, pivot: Point) => {
    // When rolling, the head seems to pivot from the nose/lips/chin area.
    // So, we'll choose any two points from the facial midline, where the first point should be the pivot, and the other "lever"
    // Plan/Execution: get the hypotenuse & opposite sides of a 90deg triangle ==> Calculate angle in radians
    const hypotenuse = Math.hypot(pivot.x - lever.x, pivot.y - lever.y);
    const opposite = pivot.y - lever.y;
    const angleInRadians = Math.asin(opposite / hypotenuse);
    const angleInDegrees = degrees(angleInRadians);
    const normalizeAngle = Math.floor(90 - angleInDegrees);
    // If lever more to the left of the pivot, then we're tilting left
    // "-" is negative direction. "+", or absence of a sign is positive direction
    const tiltDirection = pivot.x - lever.x < 0 ? -1 : 1;
    const result = normalizeAngle * tiltDirection;
    return result;
  };

  const calcPitch = (leftPoint: Point, midPoint: Point, rightPoint: Point) => {
    // Theory: While pitching, the nose is the most salient point --> That's what we'll use to make a trianle.
    // The "base" is between point that don't move when we pitch our head (i.e. an imaginary line running ear to ear through the nose).
    // Executuin: Get the opposite & adjacent lengths of the triangle from the ear's perspective. Use it to get angle.

    const base = calcLengthBetweenTwoPoints(leftPoint, rightPoint);
    // adjecent is base/2 technically.
    const baseCoords = {
      x: (leftPoint.x + rightPoint.x) / 2,
      y: (leftPoint.y + rightPoint.y) / 2,
    };
    const midToBaseLength = calcLengthBetweenTwoPoints(midPoint, baseCoords);
    const angleInRadians = Math.atan(midToBaseLength / base);
    const angleInDegrees = Math.floor(degrees(angleInRadians));
    // Account for directionality.
    // pitch forwards (_i.e. tilting your head forwards) is positive (or no sign); backward is negative.
    const direction = baseCoords.y - midPoint.y < 0 ? -1 : 1;
    const result = angleInDegrees * direction;
    return result;
  };

  if (!mesh || !mesh.positions || mesh.positions.length !== 68) return angle;
  const pt = mesh.positions;
  angle.roll = calcRoll(pt[27], pt[66]);
  angle.pitch = calcPitch(pt[14], pt[30], pt[2]);
  angle.yaw = calcYaw(pt[14], pt[33], pt[2]);
  return angle;
};
