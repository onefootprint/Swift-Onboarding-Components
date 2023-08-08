import {
  CountryCode,
  IdDocRequirement,
  SubmitDocumentSide,
  SupportedIdDocTypes,
} from '@onefootprint/types';

export type MachineContext = {
  requirement?: IdDocRequirement;
  collectingDocumentMeta?: {
    countryCode: CountryCode;
    type: SupportedIdDocTypes;
    docId: string;
  };
  currentSide?: SubmitDocumentSide;
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
        nextSideToCollect?: SubmitDocumentSide;
      };
    }
  | {
      type: 'consentCompleted';
    };
