import { type DocumentUpload, IdDocImageTypes } from '@onefootprint/types';

// Returns the index of the selfie we preview, which is the latest successful selfie upload if there is one, or the latest failed upload
// 2. The latest of exactly 3 failed selfie uploads
export const getSelfieIndex = (uploads: DocumentUpload[]): number => {
  const successfulSelfieIndex = uploads.findIndex(
    upload => upload.side === IdDocImageTypes.selfie && upload.failureReasons.length === 0,
  );

  if (successfulSelfieIndex === -1) {
    const latestFailedSelfieIndex = uploads.findIndex(upload => upload.side === IdDocImageTypes.selfie);
    return latestFailedSelfieIndex;
  }

  return successfulSelfieIndex;
};

// Returns true if the selfie we sent to incode is out of frame
const showSelfiePreview = (uploads: DocumentUpload[], visibleUploadIndex: number) => {
  const selfieIndex = getSelfieIndex(uploads);
  return selfieIndex === -1 ? false : selfieIndex !== visibleUploadIndex;
};

export default showSelfiePreview;
