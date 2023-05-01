import { UserData } from '@onefootprint/types';

export type IdvProps = {
  authToken?: string; // If provided, will skip identify step
  tenantPk?: string; // If provided, will complete onboarding
  userData?: UserData; // If provided, will bootstrap identify and pre-fill fields on onboarding
  onClose?: () => void;
  onComplete?: (validationToken: string, delay?: number) => void;
};
