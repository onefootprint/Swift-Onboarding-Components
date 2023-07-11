import cv from '@onefootprint/opencv-ts';
import { render, screen, waitFor } from '@onefootprint/test-utils';
import Image from 'next/image';
import React from 'react';

import {
  CardCaptureStatus,
  getCardCaptureStatus,
} from './graphics-processing-utils';
import { getTestImageEntries } from './graphics-processing-utils.test.config';
import { params } from './params';

const ImageComponent = ({ imgPath }: { imgPath: string }) => (
  <Image src={imgPath} width={500} height={500} alt="Test Image" />
);

const renderImage = (imgPath: string) => {
  render(<ImageComponent imgPath={imgPath} />);
};

describe.skip('Testing the image detection outputs', () => {
  const testImageEntries = getTestImageEntries();

  testImageEntries.forEach(imgEntry => {
    const [key, value] = imgEntry;
    const { path, capturable } = value;
    it(`Testing for ${key}`, async () => {
      await waitFor(() => expect(cv.Mat).not.toBeUndefined());
      renderImage(path);
      const imageElement = screen.getByRole('img');
      const cardCaptureStatus = getCardCaptureStatus(
        imageElement as HTMLImageElement,
        params,
      );
      expect(cardCaptureStatus.status === CardCaptureStatus.OK).toEqual(
        capturable,
      );
    });
  });
});
