import type { Appearance } from './appearance';
import type { BootstrapData } from './bootstrap-data';

export type ComponentKind = 'verify';

export type SupportedLocale = 'en-US' | 'es-MX';

export type SupportedLanguage = 'en' | 'es';

export type L10n = { locale?: SupportedLocale; language?: SupportedLanguage };

export type BaseComponentProps = {
  readonly appearance?: Appearance;
  readonly l10n?: L10n;
  readonly onError?: (error: string) => void;
};

export type WithAuthToken = { authToken: string; publicKey?: never };

export type WithPublicKey = { publicKey: string; authToken?: never };

export type VerifyProps = BaseComponentProps & {
  readonly bootstrapData?: BootstrapData;
  readonly onAuth?: (validationToken: string) => void;
  readonly onCancel?: () => void;
  readonly onClose?: () => void;
  readonly onComplete?: (validationToken: string) => void;
  readonly options?: Options;
} & (WithAuthToken | WithPublicKey);

export enum OnboardingStep {
  Auth = 'auth',
  Onboard = 'onboard',
}

export type OnboardingProps = VerifyProps & {
  step: OnboardingStep;
  onAuthComplete?: (tokens: {
    authToken: string;
    vaultingToken: string;
  }) => void;
};

export type ComponentProps = VerifyProps;

export type Footprint = {
  init: (props: ComponentProps) => () => void;
  destroy: () => void;
};

export enum PublicEvent {
  closed = 'closed',
  completed = 'completed',
  canceled = 'canceled',
}

export type Options = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};
