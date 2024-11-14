import type {
  BusinessDI,
  BusinessDIData,
  CollectKybDataRequirement,
  CollectKycDataRequirement,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { StateValue } from 'xstate';
import type { BootstrapBusinessData, UserData } from '../../../../types';
import type { CommonIdvContext } from '../../../../utils/state-machine';

export type BasicData = Required<Pick<BusinessDIData, BusinessDI.name>> &
  Pick<
    BusinessDIData,
    BusinessDI.doingBusinessAs | BusinessDI.corporationType | BusinessDI.phoneNumber | BusinessDI.website
  >;

export type BusinessAddressData = Required<
  Pick<
    BusinessDIData,
    | BusinessDI.addressLine1
    | BusinessDI.addressLine2
    | BusinessDI.city
    | BusinessDI.state
    | BusinessDI.country
    | BusinessDI.zip
  >
>;

export type MachineContext = {
  // Plugin context
  kybRequirement: CollectKybDataRequirement;
  kycRequirement?: CollectKycDataRequirement;
  /** Readonly object with bootstrapped ``id.*`` data */
  bootstrapUserData: Readonly<UserData>;
  /** Readonly object with bootstrapped ``business.*`` data */
  bootstrapBusinessData: Readonly<BootstrapBusinessData>;
  idvContext: CommonIdvContext;
  config?: PublicOnboardingConfig;
  /** Object with ``business.*`` form data */
  data: BusinessDIData;
  dataCollectionScreensToShow: StateValue[];
  isConfirmScreenVisible?: boolean;
};

export type MachineEvents =
  | { type: 'basicDataSubmitted'; payload: BusinessDIData }
  | { type: 'beneficialOwnerKycSubmitted' }
  | { type: 'businessAddressSubmitted'; payload: BusinessAddressData }
  | { type: 'businessDataLoadError' }
  | { type: 'confirmed' }
  | { type: 'introductionCompleted' }
  | { type: 'navigatedToPrevPage' }
  | { type: 'manageBosCompleted' }
  | { type: 'setStakeExplanationDialogConfirmed'; payload: boolean }
  | { type: 'stepUpAuthTokenCompleted'; payload: string }
  | { type: 'stepUpDecryptionCompleted'; payload: BusinessDIData }
  | { type: 'businessDataLoadSuccess'; payload: BusinessDIData };
