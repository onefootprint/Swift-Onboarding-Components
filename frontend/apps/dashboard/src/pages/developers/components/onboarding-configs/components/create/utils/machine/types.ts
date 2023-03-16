import {
  CollectedDocumentDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

export type MachineContext = {
  type?: 'kyb' | 'kyc';
  name?: string;
  kycCollect?: {
    ssnKind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
    [CollectedDocumentDataOption.document]: boolean;
    [CollectedDocumentDataOption.documentAndSelfie]: boolean;
  };
  kycAccess?: Record<
    CollectedKycDataOption | CollectedDocumentDataOption,
    boolean
  >;
};

export type MachineEvents =
  | {
      type: 'prevClicked';
    }
  | {
      type: 'typeSubmitted';
      payload: {
        type: 'kyb' | 'kyc';
      };
    }
  | {
      type: 'nameSubmitted';
      payload: {
        name: string;
      };
    }
  | {
      type: 'kycCollectSubmitted';
      payload: {
        ssnKind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
        [CollectedDocumentDataOption.document]: boolean;
        [CollectedDocumentDataOption.documentAndSelfie]: boolean;
      };
    }
  | {
      type: 'kycAccessSubmitted';
      payload: Record<
        CollectedKycDataOption | CollectedDocumentDataOption,
        boolean
      >;
    };
