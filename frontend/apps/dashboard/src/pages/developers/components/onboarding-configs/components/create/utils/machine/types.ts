import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

export type MachineContext = {
  type?: 'kyb' | 'kyc';
  name?: string;
  kycCollect?: {
    ssnKind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
    [CollectedDocumentDataOption.document]: boolean;
    [CollectedDocumentDataOption.documentAndSelfie]: boolean;
    [CollectedInvestorProfileDataOption.investorProfile]: boolean;
  };
  kycAccess?: Record<
    | CollectedKycDataOption
    | CollectedDocumentDataOption
    | CollectedInvestorProfileDataOption,
    boolean
  >;
  kybCollect?: {
    [CollectedKybDataOption.kycedBeneficialOwners]: boolean;
    [CollectedKybDataOption.website]: boolean;
    [CollectedKybDataOption.phoneNumber]: boolean;
  };
  kybAccess?: {
    allKybData: boolean;
  };
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
        [CollectedInvestorProfileDataOption.investorProfile]: boolean;
      };
    }
  | {
      type: 'kycAccessSubmitted';
      payload: Record<
        | CollectedKycDataOption
        | CollectedDocumentDataOption
        | CollectedInvestorProfileDataOption,
        boolean
      >;
    }
  | {
      type: 'kybCollectSubmitted';
      payload: {
        [CollectedKybDataOption.kycedBeneficialOwners]: boolean;
        [CollectedKybDataOption.website]: boolean;
        [CollectedKybDataOption.phoneNumber]: boolean;
      };
    }
  | {
      type: 'kybAccessSubmitted';
      payload: {
        allKybData: boolean;
        kycAccess: Record<
          | CollectedKycDataOption
          | CollectedDocumentDataOption
          | CollectedInvestorProfileDataOption,
          boolean
        >;
      };
    };
