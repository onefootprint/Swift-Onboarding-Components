import cv from '@onefootprint/opencv-ts';
import { waitFor } from '@onefootprint/test-utils';
import Jimp from 'jimp';

import {
  CardCaptureStatus,
  detectCardStatus,
} from './graphics-processing-utils';
import { getTestImageEntries } from './graphics-processing-utils.test.config';
import { params } from './params';

describe('Testing the image detection outputs', () => {
  const testImageEntries = getTestImageEntries();

  testImageEntries.forEach(imgEntry => {
    const [key, value] = imgEntry;
    const { path, capturable } = value;
    it(`Testing for ${key}`, async () => {
      await waitFor(() => expect(cv.Mat).not.toBeUndefined());
      const jimpSrc = await Jimp.read(path);
      const src = cv.matFromImageData(jimpSrc.bitmap as any as ImageData);
      const cardCaptureStatus = detectCardStatus(
        src,
        jimpSrc.bitmap.width,
        jimpSrc.bitmap.height,
        params,
      );
      expect(cardCaptureStatus.status === CardCaptureStatus.OK).toEqual(
        capturable,
      );
    });
  });
});
