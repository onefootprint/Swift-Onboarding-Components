import { TinyFaceDetectorOptions, detectSingleFace, matchDimensions, resizeResults } from 'face-api.js';

import { Logger } from '../../../../../utils/logger';
import { useFaceModel } from '../../../hooks/use-face-model-loader';
import { calculateFaceAngle, isFaceCloseEnough, isFaceInTheFrame, isHeadStraight } from '../utils/face-utils';

export enum FaceStatus {
  OK = 'ok',
  faceTooFar = 'face-too-far',
  faceOutsideTheFrame = 'face-outside-the-frame',
  headNotStraight = 'head-not-straight',
  detecting = 'detecting',
}

const useFaceDetection = () => {
  const modelsLoaded = useFaceModel();

  const options = new TinyFaceDetectorOptions();

  const getFaceStatus = async (
    videoElement: HTMLVideoElement,
    width: number,
    height: number,
    frameDimensions: {
      width: number;
      height: number;
      frameOffsetX: number;
      frameOffsetY: number;
    },
  ) => {
    if (!modelsLoaded) {
      return FaceStatus.detecting;
    }

    matchDimensions(videoElement, { width, height });
    const result = await detectSingleFace(videoElement, options).withFaceLandmarks();

    if (!result) return FaceStatus.detecting;

    const { detection } = result;
    if (!detection || !detection.box) return FaceStatus.detecting;

    const {
      box: { width: detectionBoxWidth, height: detectionBoxHeight },
    } = detection;
    if (!detectionBoxWidth || !detectionBoxHeight) {
      Logger.warn('FaceApi detection box has null or zero dimensions', {
        location: 'use-face-detection',
      });
      return FaceStatus.detecting;
    }

    const { width: frameWidth, height: frameHeight, frameOffsetX, frameOffsetY } = frameDimensions;

    const resizedDetections = resizeResults(detection, { width, height });
    const face = resizedDetections.box;
    const faceX = Math.floor(face.x);
    const faceY = Math.floor(face.y);
    const faceWidth = Math.floor(face.width);
    const faceHeight = Math.floor(face.height);

    // Order matters
    // First priority: face should be close enough
    if (!isFaceCloseEnough({ frameWidth, frameHeight, faceWidth, faceHeight })) return FaceStatus.faceTooFar;

    // Second priority: face should be inside the frame
    if (
      !isFaceInTheFrame({
        videoWidth: width,
        videoHeight: height,
        frameWidth,
        frameHeight,
        faceWidth,
        faceHeight,
        faceX,
        faceY,
        frameOffsetX,
        frameOffsetY,
      })
    )
      return FaceStatus.faceOutsideTheFrame;

    // // Third priority: head should be straight pointing to the camera
    const angle = calculateFaceAngle(result.landmarks);
    if (!isHeadStraight(angle)) return FaceStatus.headNotStraight;

    return FaceStatus.OK;
  };

  return { getFaceStatus };
};

export default useFaceDetection;
