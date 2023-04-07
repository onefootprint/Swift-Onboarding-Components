import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { DecryptedIdDoc } from '@onefootprint/types';
import React from 'react';

import DecryptedDataPreview from './decrypted-data-preview';
import {
  failedImagesFixture,
  successImagesFixture,
} from './dectypted-data-preview.test.config';

describe('<DecryptedDataPreview />', () => {
  const renderDecryptedDataPreview = (images: DecryptedIdDoc[]) => {
    customRender(<DecryptedDataPreview images={images} />);
  };

  describe('when all the uploades failed', () => {
    it('should show only the failed tab', () => {
      renderDecryptedDataPreview(failedImagesFixture);
      const failedTab = screen.getByRole('tab', { name: 'Failed uploads' });
      expect(failedTab).toBeInTheDocument();
      expect(failedTab).toHaveAttribute('data-selected', 'true');

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
    });
  });

  describe('when all the uploads succeedeed', () => {
    it('should show only the succeedeed tab', async () => {
      renderDecryptedDataPreview(successImagesFixture);
      const failedTab = screen.getByRole('tab', { name: 'Successful uploads' });
      expect(failedTab).toBeInTheDocument();
      expect(failedTab).toHaveAttribute('data-selected', 'true');

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
    });
  });

  describe('when there are both failed and succeedeed uploads', () => {
    it('should show both tabs', async () => {
      const images = [...successImagesFixture, ...failedImagesFixture];
      renderDecryptedDataPreview(images);
      const failedTab = screen.getByRole('tab', { name: 'Failed uploads' });
      const successTab = screen.getByRole('tab', {
        name: 'Successful uploads',
      });
      expect(failedTab).toBeInTheDocument();
      expect(successTab).toBeInTheDocument();
      expect(failedTab).toHaveAttribute('data-selected', 'false');
      expect(successTab).toHaveAttribute('data-selected', 'true');

      let imagesElements = screen.getAllByRole('img');
      expect(imagesElements).toHaveLength(2);

      await userEvent.click(failedTab);
      imagesElements = screen.getAllByRole('img');
      expect(failedTab).toHaveAttribute('data-selected', 'true');
      expect(successTab).toHaveAttribute('data-selected', 'false');
      expect(imagesElements).toHaveLength(2);
    });
  });
});
