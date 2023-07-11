import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  IdDocRegionality,
  IdDocType,
} from '@onefootprint/types';

export type IdDocData = {
  selfieRequired: boolean;
  types: IdDocType[];
  regionality: IdDocRegionality;
};

export type KycCollectData = {
  ssnKind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
  [CollectedKycDataOption.nationality]: boolean;
  idDoc: IdDocData;
};

export type KycInvestorProfileData = {
  [CollectedInvestorProfileDataOption.investorProfile]: boolean;
};

export type KycAccessData = Record<
  | CollectedKycDataOption
  | CollectedDocumentDataOption
  | CollectedInvestorProfileDataOption,
  boolean
>;

export type KybCollectData = {
  [CollectedKybDataOption.kycedBeneficialOwners]: boolean;
  [CollectedKybDataOption.website]: boolean;
  [CollectedKybDataOption.phoneNumber]: boolean;
};

export type KybAccessData = {
  allKybData: boolean;
};

export type MachineContext = {
  type?: 'kyb' | 'kyc';
  name?: string;
  kycCollect?: KycCollectData;
  kycInvestorProfile?: KycInvestorProfileData;
  kycAccess?: KycAccessData;
  kybCollect?: KybCollectData;
  kybAccess?: KybAccessData;
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
      payload: KycCollectData;
    }
  | {
      type: 'kycInvestorProfileSubmitted';
      payload: KycInvestorProfileData;
    }
  | {
      type: 'kycAccessSubmitted';
      payload: KycAccessData;
    }
  | {
      type: 'kybCollectSubmitted';
      payload: KybCollectData;
    }
  | {
      type: 'kybAccessSubmitted';
      payload: {
        kybAccess: KybAccessData;
        kycAccess: KycAccessData;
      };
    };
