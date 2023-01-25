import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { DecryptedIdDoc } from '@onefootprint/types';
import React from 'react';

import DecryptedDataPreview from './decrypted-data-preview';
import {
  failedTestImages,
  successfulTestImages,
  testImage1,
  testImage2,
  testImage3,
} from './dectypted-data-preview.test.config';

describe('<DecryptedDataPreview />', () => {
  const renderDecryptedDataPreview = (images: DecryptedIdDoc[]) => {
    customRender(<DecryptedDataPreview images={images} />);
  };

  describe('when all images are failed uploads', () => {
    it('shows only failed tab with all images', async () => {
      renderDecryptedDataPreview(failedTestImages);
      const failedTab = screen.getByRole('tab', { name: 'Failed uploads' });
      expect(failedTab).toBeInTheDocument();
      expect(failedTab).toHaveAttribute('data-selected', 'true');

      let images = screen.getAllByRole('img');
      expect(images.length).toEqual(2);
      expect(images[0]).toHaveAttribute('src', testImage2);
      expect(images[1]).toHaveAttribute('src', testImage2);

      const nextImage = screen.getByLabelText('Slide 1');
      await userEvent.click(nextImage);
      await waitFor(() => {
        images = screen.getAllByRole('img');
        expect(images.length).toEqual(2);
      });
      await waitFor(() => {
        images = screen.getAllByRole('img');
        expect(images[0]).toHaveAttribute('src', testImage3);
      });
      await waitFor(() => {
        images = screen.getAllByRole('img');
        expect(images[1]).toHaveAttribute('src', testImage3);
      });
    });
  });

  describe('when there are successful uploads', () => {
    it('shows both tabs, success selected by default', async () => {
      renderDecryptedDataPreview([
        ...successfulTestImages,
        ...failedTestImages,
      ]);
      const successfulTab = screen.getByRole('tab', {
        name: 'Successful uploads',
      });
      expect(successfulTab).toBeInTheDocument();
      expect(successfulTab).toHaveAttribute('data-selected', 'true');

      const failedTab = screen.getByRole('tab', { name: 'Failed uploads' });
      expect(failedTab).toBeInTheDocument();
      expect(failedTab).toHaveAttribute('data-selected', 'false');

      await userEvent.click(failedTab);
      await waitFor(() => {
        expect(failedTab).toHaveAttribute('data-selected', 'true');
      });
      await waitFor(() => {
        expect(successfulTab).toHaveAttribute('data-selected', 'false');
      });

      await userEvent.click(successfulTab);
      await waitFor(() => {
        expect(successfulTab).toHaveAttribute('data-selected', 'true');
      });

      const images = screen.getAllByRole('img');
      expect(images.length).toEqual(2);
      expect(images[0]).toHaveAttribute('src', testImage1);
      expect(images[1]).toHaveAttribute('src', testImage1);
    });
  });
});
