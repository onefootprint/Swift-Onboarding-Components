import {
  CountryCode,
  IdDocRequirement,
  SupportedIdDocTypes,
  UploadDocumentSide,
} from '@onefootprint/types';

export type MachineContext = {
  requirement?: IdDocRequirement;
  collectingDocumentMeta?: {
    countryCode: CountryCode;
    type: SupportedIdDocTypes;
    docId: string;
  };
  currentSide?: UploadDocumentSide;
};

export type MachineEvents =
  | {
      type: 'countryAndTypeSubmitted';
      payload: {
        documentType: SupportedIdDocTypes;
        countryCode: CountryCode;
      };
    }
  | {
      type: 'backButtonTapped';
    }
  | {
      type: 'imageSubmitted';
      payload: {
        nextSideToCollect?: UploadDocumentSide;
      };
    }
  | {
      type: 'consentCompleted';
    };
