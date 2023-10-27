import constate from 'constate';
import { nets } from 'face-api.js';
import { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import Logger from '../../../utils/logger';

type FaceModelLoaderType = {
  selfieRequired: boolean;
};

const useFaceModelLoader = ({ selfieRequired }: FaceModelLoaderType) => {
  const MODEL_URL = '/model'; // make sure to copy the "model" directory from "face-api" node module to "frontend/apps/handoff/public"
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Loading models take time; therefore we want to load them asynchronously before we need them
  // This reduces the detection time when you are on selfie page by removing the time to load the models
  useEffectOnce(() => {
    const loadModels = async () => {
      if (selfieRequired) {
        Promise.all([
          nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ])
          .then(() => {
            setModelsLoaded(true);
          })
          .catch(err => {
            Logger.error(`Error loading the face models: ${err}`, 'id-doc');
          });
      }
    };
    loadModels();
  });

  return modelsLoaded;
};

const [FaceModelProvider, useFaceModel] = constate(useFaceModelLoader);

export { FaceModelProvider, useFaceModel };
