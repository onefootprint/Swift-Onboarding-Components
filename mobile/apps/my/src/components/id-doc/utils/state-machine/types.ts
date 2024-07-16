import type { CountryCode, IdDocRequirement, SupportedIdDocTypes, UploadDocumentSide } from '@onefootprint/types';

export type MachineContext = {
  requirement?: IdDocRequirement;
  currentSide?: UploadDocumentSide;
  collectingDocumentMeta?: {
    countryCode: CountryCode;
    type?: SupportedIdDocTypes;
    docId?: string;
  };
};

export type MachineEvents =
  | {
      type: 'countryAndTypeSubmitted';
      payload: {
        documentType: SupportedIdDocTypes;
        countryCode: CountryCode;
        docId: string;
      };
    }
  | {
      type: 'backButtonTapped';
    }
  | {
      type: 'imageSubmitted';
      payload: {
        nextSideToCollect?: UploadDocumentSide;
        isRetryLimitExceeded?: boolean;
      };
    }
  | {
      type: 'consentCompleted';
    }
  | {
      type: 'retryLimitExceeded';
    };
