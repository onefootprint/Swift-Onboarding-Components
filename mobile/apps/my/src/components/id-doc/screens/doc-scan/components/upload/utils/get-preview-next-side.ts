import { SupportedIdDocTypes, UploadDocumentSide } from '@onefootprint/types';

const getPreviewNextSide = (side: UploadDocumentSide, type: SupportedIdDocTypes): UploadDocumentSide | null => {
  if (side === UploadDocumentSide.Selfie) {
    return null;
  }
  if (type === SupportedIdDocTypes.passport || type === SupportedIdDocTypes.visa) {
    return UploadDocumentSide.Selfie;
  }
  if (side === UploadDocumentSide.Front) {
    return UploadDocumentSide.Back;
  }
  return UploadDocumentSide.Selfie;
};

export default getPreviewNextSide;
