import {
  detectSingleFace,
  matchDimensions,
  nets,
  resizeResults,
  TinyFaceDetectorOptions,
} from 'face-api.js';
import { useEffect, useState } from 'react';

import {
  calculateFaceAngle,
  isFaceCloseEnough,
  isFaceInTheFrame,
  isHeadStraight,
} from '../utils/face-utils';

const MODEL_URL = '/model'; // make sure to copy the "model" directory from "@vladmandic/face-api" module to "frontend/apps/handoff/public"

export enum FaceStatus {
  OK = 'ok',
  faceTooFar = 'face-too-far',
  faceOutsideTheFrame = 'face-outside-the-frame',
  headNotStraight = 'head-not-straight',
  detecting = 'detecting',
}

const useFaceDetection = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const options = new TinyFaceDetectorOptions();

  useEffect(() => {
    const loadModels = async () => {
      Promise.all([
        nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]).then(() => {
        setModelsLoaded(true);
      });
    };
    loadModels();
  }, [modelsLoaded]);

  const getFaceStatus = async (
    videoElement: HTMLVideoElement,
    width: number,
    height: number,
    frameDimensions: {
      width: number;
      height: number;
    },
  ) => {
    if (!modelsLoaded) {
      return FaceStatus.detecting;
    }

    matchDimensions(videoElement, {
      width,
      height,
    });
    const result = await detectSingleFace(
      videoElement,
      options,
    ).withFaceLandmarks();

    if (!result) return FaceStatus.detecting;
    const { detection } = result;
    const resizedDetections = resizeResults(detection, {
      width,
      height,
    });

    const { width: frameWidth, height: frameHeight } = frameDimensions;
    const {
      x: faceX,
      y: faceY,
      width: faceWidth,
      height: faceHeight,
    } = resizedDetections.box;

    // Order matters
    // First priority: face should be close enough
    if (!isFaceCloseEnough({ frameWidth, frameHeight, faceWidth, faceHeight }))
      return FaceStatus.faceTooFar;

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
