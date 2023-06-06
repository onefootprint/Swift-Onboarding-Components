import {
  CountryCode,
  // IdDocImageError,
  IdDocRequirement,
  IdDocType,
} from '@onefootprint/types';

export type MachineContext = {
  requirement: IdDocRequirement;
  collectingDocumentMeta?: {
    countryCode: CountryCode;
    type: IdDocType;
  };
};

export type MachineEvents = {
  type: 'countryAndTypeSubmitted';
  payload: {
    documentType: IdDocType;
    countryCode: CountryCode;
  };
};
// | {
//     type: 'receivedImage';
//     payload: {
//       image: string;
//     };
//   }
// | {
//     type: 'nextSide';
//     payload: {
//       nextSideToCollect: string;
//     };
//   }
// | {
//     type: 'processingErrored';
//     payload: {
//       errors: IdDocImageError[];
//     };
//   }
// | {
//     type: 'processingSucceeded';
//     payload: {
//       nextSideToCollect?: string;
//     };
//   }
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
