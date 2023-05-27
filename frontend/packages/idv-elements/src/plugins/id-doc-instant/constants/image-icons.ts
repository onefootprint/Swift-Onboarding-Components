import {
  IcoIdBack40,
  IcoIdFront40,
  Icon,
  IcoSelfie40,
} from '@onefootprint/icons';

export enum ImageTypes {
  front = 'front',
  back = 'back',
  selfie = 'selfie',
  oneSide = 'one-side',
}

export type ImageIconsType = {
  [key in ImageTypes]: Icon;
};

export const imageIcons: ImageIconsType = {
  [ImageTypes.front]: IcoIdFront40,
  [ImageTypes.oneSide]: IcoIdFront40,
  [ImageTypes.back]: IcoIdBack40,
  [ImageTypes.selfie]: IcoSelfie40,
};
