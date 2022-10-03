import { CollectedDataOption } from '../data/collected-data-option';

export enum OnboardingRequirements {
  liveness = 'liveness',
  collectDocument = 'collect_document',
  collectKycData = 'collect_kyc_data',
}

export type OnboardingStatusRequest = {
  authToken: string;
};

export type OnboardingStatusResponse = {
  requirements: OnboardingRequirements[];
  missingKycData?: CollectedDataOption[]; // TODO: fix
};
