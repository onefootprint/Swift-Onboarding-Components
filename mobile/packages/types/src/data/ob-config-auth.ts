export const CLIENT_PUBLIC_KEY_HEADER = 'X-Onboarding-Config-Key';
export const KYB_BO_SESSION_AUTHORIZATION_HEADER = 'X-Kyb-Bo-Token';

export type ObConfigAuth =
  | {
      [CLIENT_PUBLIC_KEY_HEADER]: string;
    }
  | {
      [KYB_BO_SESSION_AUTHORIZATION_HEADER]: string;
    };
