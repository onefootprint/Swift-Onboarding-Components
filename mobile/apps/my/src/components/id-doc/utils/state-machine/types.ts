import {
  CountryCode,
  IdDocImageError,
  IdDocRequirement,
  IdDocType,
} from '@onefootprint/types';

import { DocSide } from '../../id-doc.types';

export type MachineContext = {
  requirement?: IdDocRequirement;
  collectingDocumentMeta?: {
    countryCode: CountryCode;
    type: IdDocType;
  };
  currentStep: {
    errors: IdDocImageError[];
    image?: string;
    side: DocSide;
  };
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
        image: string;
      };
    };

// | {
//     type: 'consentReceived';
//   }
// | {
//     type: 'startSelfieCapture';
//   }
// | {
//     type: 'cameraErrored';
//   }
// | {
//     type: 'navigatedToPrev';
//   }
// | {
//     type: 'retryLimitExceeded';
//   };
