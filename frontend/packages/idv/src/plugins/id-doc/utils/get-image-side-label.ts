import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';

const getImageSideLabel = (
  imageType: IdDocImageTypes,
  type?: SupportedIdDocTypes,
) => {
  if (imageType === IdDocImageTypes.selfie) return 'selfie';
  if (
    type === SupportedIdDocTypes.passport ||
    type === SupportedIdDocTypes.visa
  ) {
    return 'photo page';
  }
  if (type === SupportedIdDocTypes.proofOfAddress) {
    return '';
  }
  return `${imageType} side`;
};

export default getImageSideLabel;
