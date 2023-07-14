import { renderHook, waitFor } from '@onefootprint/test-utils';
import Jimp from 'jimp';
import { useOpenCv } from 'opencv-react-ts';

import {
  CardCaptureStatus,
  detectCardStatus,
} from './graphics-processing-utils';
import { getTestImageEntries } from './graphics-processing-utils.test.config';
import { params } from './params';

describe('Testing the image detection outputs', () => {
  const testImageEntries = getTestImageEntries();
  const { result } = renderHook(() => useOpenCv());
  const { cv, loaded } = result.current;

  testImageEntries.forEach(imgEntry => {
    const [key, value] = imgEntry;
    const { path, capturable } = value;
    // TODO: Remove this test
    // We are fetching cv library from a remote source, that's why we can't test its performance with Jest
    it.skip(`Testing for ${key}`, async () => {
      await waitFor(() => expect(cv).not.toBeUndefined());
      await waitFor(() => expect(loaded).not.toBeFalsy());
      if (!cv) return; // the await statement above to confirm that cv is defined, but "detectCardStatus" screams because type of 'cv' still has undefined in it
      const jimpSrc = await Jimp.read(path);
      const src = cv.matFromImageData(jimpSrc.bitmap as any as ImageData);
      const cardCaptureStatus = detectCardStatus(
        cv,
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
