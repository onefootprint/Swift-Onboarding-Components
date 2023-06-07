import {
  CountryCode,
  IdDocRequirement,
  IdDocType,
  SubmitDocumentSide,
} from '@onefootprint/types';

export type MachineContext = {
  requirement?: IdDocRequirement;
  collectingDocumentMeta?: {
    countryCode: CountryCode;
    type: IdDocType;
  };
  currentSide?: SubmitDocumentSide;
};

export type MachineEvents =
  | {
      type: 'countryAndTypeSubmitted';
      payload: {
        documentType: IdDocType;
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
    };
