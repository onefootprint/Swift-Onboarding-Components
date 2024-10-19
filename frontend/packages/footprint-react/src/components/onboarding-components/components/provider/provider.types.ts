import type { FootprintAppearance, FootprintComponent, SandboxOutcome } from '@onefootprint/footprint-js';
import type { ChallengeData, PublicOnboardingConfig } from '@onefootprint/types';
import type React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { FormValues } from '../../../../types';
import type { Translations } from '../../constants/translations';
import type AuthTokenStatus from '../../types/auth-token-status';

type PartialProKeys<T> = {
  [K in keyof T as K extends `pro${string}` ? K : never]?: T[K];
};

export type SupportedLocale = 'en-US' | 'es-MX';

export type SupportedLanguage = 'en';

export type L10n = {
  language: SupportedLanguage;
  locale: SupportedLocale;
  translations: Translations;
};

export type ContextData = {
  appearance?: FootprintAppearance;
  authToken?: string;
  authTokenStatus?: AuthTokenStatus;
  challengeData?: ChallengeData;
  didCallRequiresAuth: boolean;
  fpInstance?: FootprintComponent;
  isReady: boolean;
  l10n: L10n;
  onboardingConfig?: PublicOnboardingConfig;
  publicKey: string;
  sandboxId?: string;
  sandboxOutcome?: SandboxOutcome;
  vaultData?: FormValues;
  vaultingToken?: string;
  verifiedAuthToken?: string;
  handoffCallbacks?: {
    onCancel?: () => void;
    onClose?: () => void;
    onComplete?: (validationToken: string) => void;
    onError?: (error: unknown) => void;
  };
};

export type UpdateContext = Dispatch<SetStateAction<ContextData>>;

export type ProviderProps = Pick<
  ContextData,
  'appearance' | 'authToken' | 'publicKey' | 'sandboxOutcome' | 'sandboxId'
> & {
  children: React.ReactNode;
  l10n?: {
    customTranslations?: PartialProKeys<Translations>;
    language?: SupportedLanguage;
    locale?: SupportedLocale;
  };
};

export type PropsUpdated = Pick<
  ProviderProps,
  'appearance' | 'authToken' | 'publicKey' | 'sandboxOutcome' | 'sandboxId'
> &
  Pick<ContextData, 'l10n'>;
