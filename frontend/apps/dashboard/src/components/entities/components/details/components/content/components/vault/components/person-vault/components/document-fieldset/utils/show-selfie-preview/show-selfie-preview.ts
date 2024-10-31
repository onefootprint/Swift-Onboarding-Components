import { type DocumentUpload, IdDocImageTypes } from '@onefootprint/types';

// Returns true if there is a successful selfie upload and that upload is out of frame
const showSelfiePreview = (uploads: DocumentUpload[], visibleUploadIndex: number) => {
  const successfulSelfieIndex = uploads.findIndex(
    upload => upload.side === IdDocImageTypes.selfie && upload.failureReasons.length === 0,
  );
  return successfulSelfieIndex === -1 ? false : successfulSelfieIndex !== visibleUploadIndex;
};

export default showSelfiePreview;
