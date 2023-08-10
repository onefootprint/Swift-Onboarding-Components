import { SupportedIdDocTypes, UploadDocumentSide } from '@onefootprint/types';

export type GetStepperValuesProps = {
  type: SupportedIdDocTypes;
  shouldCollectSelfie: boolean;
  currentSide: UploadDocumentSide;
};

const getStepperValues = ({
  type,
  shouldCollectSelfie,
  currentSide,
}: GetStepperValuesProps) => {
  let totalSteps = 0;
  let currentStep = 0;

  if (type === SupportedIdDocTypes.passport) {
    totalSteps = 1;
  } else if (
    type === SupportedIdDocTypes.driversLicense ||
    type === SupportedIdDocTypes.idCard
  ) {
    // front and back
    totalSteps = 2;
  }
  if (shouldCollectSelfie) {
    totalSteps += 1;
  }

  if (currentSide === UploadDocumentSide.Front) {
    currentStep = 0;
  } else if (currentSide === UploadDocumentSide.Back) {
    currentStep = 1;
  }
  if (currentSide === UploadDocumentSide.Selfie) {
    currentStep = totalSteps - 1;
  }

  return { value: currentStep, max: totalSteps };
};

export default getStepperValues;
