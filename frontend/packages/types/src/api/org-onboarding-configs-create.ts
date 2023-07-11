import { CollectedDataOption } from '../data/collected-data-option';

export type OrgOnboardingConfigCreateRequest = {
  name: string;
  // document types, regionality and selfie are passed in a single string separated by ','
  // 'none' is passed if all three types are selected
  // eg: 'document.passport,id_card.regionality.selfie_required'.
  mustCollectData: CollectedDataOption[];
  canAccessData: CollectedDataOption[];
};

export type OrgOnboardingConfigCreateResponse = string;
