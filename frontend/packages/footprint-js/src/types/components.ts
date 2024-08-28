import type { Appearance } from './appearance';
import type { BootstrapData, FootprintUserData } from './bootstrap-data';

export enum ComponentKind {
  Auth = 'auth',
  Components = 'components',
  Form = 'form',
  Render = 'render',
  UpdateLoginMethods = 'update_login_methods',
  Verify = 'verify',
  VerifyButton = 'verify-button',
}

export type SupportedLocale = 'en-US' | 'es-MX';

export type SupportedLanguage = 'en' | 'es';

export type L10n = { locale?: SupportedLocale; language?: SupportedLanguage };

export type Options = { showCompletionPage?: boolean; showLogo?: boolean };

export type Variant = 'modal' | 'drawer' | 'inline';

export type AdditionalComponentsSdkFunctionality = {
  relayFromComponents?: () => void;
};

export type Component = {
  destroy: () => void;
  render: () => Promise<void>;
} & AdditionalComponentsSdkFunctionality;

export type Footprint = {
  init: (props: Props) => Component;
};

export type Props =
  | AuthProps
  | FormProps
  | RenderProps
  | UpdateLoginMethodsProps
  | VerifyButtonProps
  | VerifyProps
  | ComponentsSdkProps;

export type PropsBase = {
  readonly appearance?: Appearance;
  readonly containerId?: string;
  readonly kind: `${ComponentKind}`;
  readonly l10n?: L10n;
  readonly onError?: (error: string) => void;
  readonly variant?: Variant;
};

/** verify */
export type VerifyAuthToken = { authToken: string; publicKey?: never };

export type VerifyPublicKey = { publicKey: string; authToken?: never };

type VerifyVariant = 'modal' | 'drawer';

type BootstrapKeys = 'userData' | 'bootstrapData';

type VerifyDataKeys = BootstrapKeys | 'publicKey' | 'options' | 'authToken' | 'l10n';

type OverallOutcome = 'pass' | 'fail' | 'manual_review' | 'use_rules_outcome' | 'step_up';
type IdDocOutcome = 'pass' | 'fail' | 'real';

export type SandboxOutcome = {
  readonly overallOutcome?: OverallOutcome;
  readonly documentOutcome?: IdDocOutcome;
};

type VerifyPropsBase<TAuth> = PropsBase & {
  readonly bootstrapData?: BootstrapData;
  readonly onAuth?: (validationToken: string) => void;
  readonly onCancel?: () => void;
  readonly onClose?: () => void;
  readonly onComplete?: (validationToken: string) => void;
  readonly options?: Options;
  readonly sandboxOutcome?: SandboxOutcome;
  /** @deprecated use bootstrapData instead */
  readonly userData?: FootprintUserData;
} & TAuth;

export type VerifyProps = VerifyPropsBase<VerifyAuthToken | VerifyPublicKey> & {
  readonly kind: `${ComponentKind.Verify}`;
  readonly variant?: VerifyVariant;
};

// The subset of VerifyProps that are sent to the iframe via sdk_args
export type VerifyDataProps = Pick<VerifyProps, VerifyDataKeys> & {
  isComponentsSdk?: boolean;
  fixtureResult?: OverallOutcome;
  documentFixtureResult?: IdDocOutcome;
};

/** Components SDK. Just a subset of Verify */
export type ComponentsSdkProps = VerifyPropsBase<VerifyPublicKey | VerifyAuthToken> & {
  readonly onRelayToComponents?: (authToken: string) => void;
  readonly kind: `${ComponentKind.Components}`;
  readonly variant?: VerifyVariant;
};

/** verify-button */
export type VerifyButtonProps = VerifyPropsBase<VerifyAuthToken | VerifyPublicKey> & {
  readonly containerId: string;
  readonly dialogVariant?: VerifyVariant;
  readonly kind: `${ComponentKind.VerifyButton}`;
  readonly label?: string;
  readonly onClick?: () => void;
  readonly variant: 'inline';
};
export type VerifyButtonDataProps = Pick<VerifyButtonProps, VerifyDataKeys | 'label'>;

/** render */
export type RenderProps = PropsBase & {
  readonly authToken: string;
  readonly canCopy?: boolean;
  readonly containerId: string;
  readonly defaultHidden?: boolean;
  readonly id: string; // a valid data identifier
  readonly kind: `${ComponentKind.Render}`;
  readonly label?: string; // defaults to a nice string chosen for that data identifier
  readonly showHiddenToggle?: boolean;
  readonly variant: 'inline';
};

export type RenderDataProps = Pick<
  RenderProps,
  'authToken' | 'canCopy' | 'defaultHidden' | 'id' | 'label' | 'showHiddenToggle'
>;

/** form */
export type FormRef = { save: () => Promise<void> };
export type FormOptions = {
  readonly hideButtons?: boolean;
  readonly hideCancelButton?: boolean;
  readonly hideFootprintLogo?: boolean;
};

export type FormProps = PropsBase & {
  readonly authToken: string;
  readonly containerId?: string; // required for inline variant
  readonly getRef?: (ref: FormRef) => void; // returns a ref on mount that the tenants can trigger form actions from
  readonly kind: `${ComponentKind.Form}`;
  readonly onCancel?: () => void;
  readonly onClose?: () => void;
  readonly onComplete?: () => void;
  readonly options?: FormOptions;
  readonly title?: string;
  readonly variant?: Variant; // supports all variants, falls back to modal, so optional
};

export type FormDataProps = Pick<FormProps, 'authToken' | 'options' | 'title' | 'l10n'>;

/** auth */
type AuthPropsBase = PropsBase & {
  readonly bootstrapData?: Pick<BootstrapData, 'id.email' | 'id.phone_number'>;
  readonly kind: `${ComponentKind.Auth}`;
  readonly onCancel?: () => void;
  readonly onClose?: () => void;
  readonly onComplete?: (validationToken: string) => void;
  readonly options?: Pick<Options, 'showLogo'>;
  /** @deprecated: use bootstrapData instead */
  readonly userData?: Pick<FootprintUserData, 'id.email' | 'id.phone_number'>;
  readonly variant?: 'modal' | 'drawer';
};

export type AuthProps = AuthPropsBase & {
  readonly publicKey?: string;
  readonly authToken?: string;
  /** @deprecated after version 3.9.0 */
  readonly updateLoginMethods?: true;
};

export type AuthDataProps = Pick<
  AuthProps,
  BootstrapKeys | 'authToken' | 'updateLoginMethods' | 'publicKey' | 'l10n' | 'options'
>;

/** update_login_methods */
export type UpdateLoginMethodsProps = PropsBase & {
  readonly authToken?: string;
  readonly bootstrapData?: Pick<BootstrapData, 'id.email' | 'id.phone_number'>;
  readonly kind: `${ComponentKind.UpdateLoginMethods}`;
  readonly onCancel?: () => void;
  readonly onClose?: () => void;
  readonly onComplete?: (validationToken: string) => void;
  readonly options?: Pick<Options, 'showLogo'>;
  /** @deprecated use bootstrapData instead */
  readonly userData?: Pick<FootprintUserData, 'id.email' | 'id.phone_number'>;
  readonly variant?: 'modal' | 'drawer';
};

export type UpdateLoginMethodsDataProps = Pick<
  UpdateLoginMethodsProps,
  BootstrapKeys | 'authToken' | 'l10n' | 'options'
>;
