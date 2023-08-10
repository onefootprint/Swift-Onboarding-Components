import { SupportedIdDocTypes, UploadDocumentSide } from '@onefootprint/types';

import getStepperValues from '.';

describe('getStepperValues', () => {
  describe('passport', () => {
    it('should return correct values for passport without selfie', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.passport,
        shouldCollectSelfie: false,
        currentSide: UploadDocumentSide.Front,
      });
      expect(value).toEqual(0);
      expect(max).toEqual(1);
    });

    it('should return correct values for passport with selfie on first step', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.passport,
        shouldCollectSelfie: true,
        currentSide: UploadDocumentSide.Front,
      });
      expect(value).toEqual(0);
      expect(max).toEqual(2);
    });

    it('should return correct values for passport with selfie on selfie stage', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.passport,
        shouldCollectSelfie: true,
        currentSide: UploadDocumentSide.Selfie,
      });
      expect(value).toEqual(1);
      expect(max).toEqual(2);
    });
  });
  describe('drivers license', () => {
    it('should return correct values for drivers license without selfie on front', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.driversLicense,
        shouldCollectSelfie: false,
        currentSide: UploadDocumentSide.Front,
      });
      expect(value).toEqual(0);
      expect(max).toEqual(2);
    });

    it('should return correct values for drivers license without selfie on back', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.driversLicense,
        shouldCollectSelfie: false,
        currentSide: UploadDocumentSide.Back,
      });
      expect(value).toEqual(1);
      expect(max).toEqual(2);
    });

    it('should return correct values for drivers license with selfie on front', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.driversLicense,
        shouldCollectSelfie: true,
        currentSide: UploadDocumentSide.Front,
      });
      expect(value).toEqual(0);
      expect(max).toEqual(3);
    });

    it('should return correct values for drivers license with selfie on back', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.driversLicense,
        shouldCollectSelfie: true,
        currentSide: UploadDocumentSide.Back,
      });
      expect(value).toEqual(1);
      expect(max).toEqual(3);
    });

    it('should return correct values for drivers license with selfie on selfie stage', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.driversLicense,
        shouldCollectSelfie: true,
        currentSide: UploadDocumentSide.Selfie,
      });
      expect(value).toEqual(2);
      expect(max).toEqual(3);
    });
  });
  describe('ID card', () => {
    it('should return correct values for id card without selfie on front', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.idCard,
        shouldCollectSelfie: false,
        currentSide: UploadDocumentSide.Front,
      });
      expect(value).toEqual(0);
      expect(max).toEqual(2);
    });

    it('should return correct values for id card without selfie on back', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.idCard,
        shouldCollectSelfie: false,
        currentSide: UploadDocumentSide.Back,
      });
      expect(value).toEqual(1);
      expect(max).toEqual(2);
    });

    it('should return correct values for id card with selfie on front', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.idCard,
        shouldCollectSelfie: true,
        currentSide: UploadDocumentSide.Front,
      });
      expect(value).toEqual(0);
      expect(max).toEqual(3);
    });

    it('should return correct values for id card with selfie on back', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.idCard,
        shouldCollectSelfie: true,
        currentSide: UploadDocumentSide.Back,
      });
      expect(value).toEqual(1);
      expect(max).toEqual(3);
    });

    it('should return correct values for id card with selfie on selfie stage', () => {
      const { value, max } = getStepperValues({
        type: SupportedIdDocTypes.idCard,
        shouldCollectSelfie: true,
        currentSide: UploadDocumentSide.Selfie,
      });
      expect(value).toEqual(2);
      expect(max).toEqual(3);
    });
  });
});
