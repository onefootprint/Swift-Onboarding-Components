import showSelfiePreview from './show-selfie-preview';
import { uploadsWithFailedSelfie, uploadsWithSuccessfulSelfies } from './show-selfie-preview.test.config';
import { uploadsWithNoSelfies } from './show-selfie-preview.test.config';

describe('showSelfiePreview', () => {
  it('should return false if there are no successful selfie uploads', () => {
    expect(showSelfiePreview([], 0)).toBe(false);
    expect(showSelfiePreview(uploadsWithNoSelfies, 0)).toBe(false);
    expect(showSelfiePreview(uploadsWithFailedSelfie, 0)).toBe(false);
  });

  it('should return false if there is a successful selfie upload in frame', () => {
    expect(showSelfiePreview(uploadsWithSuccessfulSelfies, 2)).toBe(false);
  });

  it('should return true if there is a successful selfie upload and it is out of frame', () => {
    expect(showSelfiePreview(uploadsWithSuccessfulSelfies, 0)).toBe(true);
    expect(showSelfiePreview(uploadsWithSuccessfulSelfies, 1)).toBe(true);
  });
});
