import {
  IcoIdBack40,
  IcoIdFront40,
  Icon,
  IcoSelfie40,
} from '@onefootprint/icons';
import { IdDocImageTypes } from '@onefootprint/types';

export type ImageIconsType = {
  [key in IdDocImageTypes]: Icon;
};

export const imageIcons: ImageIconsType = {
  [IdDocImageTypes.front]: IcoIdFront40,
  [IdDocImageTypes.back]: IcoIdBack40,
  [IdDocImageTypes.selfie]: IcoSelfie40,
};
