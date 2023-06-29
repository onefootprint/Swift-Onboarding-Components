import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  IdDocRegionality,
  IdDocType,
} from '@onefootprint/types';

type IdDocData = {
  selfieRequired: boolean;
  types: IdDocType[];
  regionality: IdDocRegionality;
};

export type MachineContext = {
  type?: 'kyb' | 'kyc';
  name?: string;
  kycCollect?: {
    ssnKind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
    [CollectedKycDataOption.nationality]: boolean;
    idDoc: IdDocData;
  };
  kycStepUp?: {
    idDoc: IdDocData;
  };
  kycInvestorProfile?: {
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
  kybBoStepUp?: {
    idDoc: IdDocData;
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
        [CollectedKycDataOption.nationality]: boolean;
        idDoc: IdDocData;
      };
    }
  | {
      type: 'kycStepUpSubmitted';
      payload: {
        idDoc: IdDocData;
      };
    }
  | {
      type: 'kycInvestorProfileSubmitted';
      payload: {
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
      type: 'kybBoStepUpSubmitted';
      payload: {
        idDoc: IdDocData;
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
