import showSelfiePreview from './show-selfie-preview';
import {
  uploadsWithFailedSelfie,
  uploadsWithSuccessfulAndThreeFailedSelfies,
  uploadsWithSuccessfulSelfies,
} from './show-selfie-preview.test.config';
import { uploadsWithNoSelfies } from './show-selfie-preview.test.config';

describe('showSelfiePreview', () => {
  it('should return false if there are no selfie uploads', () => {
    expect(showSelfiePreview([], 0)).toBe(false);
    expect(showSelfiePreview(uploadsWithNoSelfies, 0)).toBe(false);
  });

  it('should return false if the latest successful selfie, or the latest failed if there is no successful selfie, is in frame', () => {
    expect(showSelfiePreview(uploadsWithSuccessfulSelfies, 2)).toBe(false);
    expect(showSelfiePreview(uploadsWithSuccessfulAndThreeFailedSelfies, 2)).toBe(false);
    expect(showSelfiePreview(uploadsWithFailedSelfie, 2)).toBe(false);
  });

  it('should return true if the latest successful or failed selfie is out of frame', () => {
    expect(showSelfiePreview(uploadsWithSuccessfulSelfies, 0)).toBe(true);
    expect(showSelfiePreview(uploadsWithSuccessfulSelfies, 1)).toBe(true);
    expect(showSelfiePreview(uploadsWithSuccessfulAndThreeFailedSelfies, 3)).toBe(true);
    expect(showSelfiePreview(uploadsWithFailedSelfie, 0)).toBe(true);
    expect(showSelfiePreview(uploadsWithFailedSelfie, 1)).toBe(true);
  });
});
