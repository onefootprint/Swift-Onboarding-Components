import { IdvBootstrapData, ObConfigAuth } from '@onefootprint/types';

export type IdvProps = {
  obConfigAuth?: ObConfigAuth;
  authToken?: string; // If provided, will skip identify step
  bootstrapData?: IdvBootstrapData; // If provided, will bootstrap identify and pre-fill fields on onboarding
  isTransfer?: boolean;
  onClose?: () => void;
  onComplete?: (validationToken?: string, delay?: number) => void;
};
