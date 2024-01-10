import type { Appearance } from './appearance';
import type { FootprintUserData as UserData } from './user-data';

export type Footprint = {
  init: (props: Props) => Component;
};

export type Component = {
  destroy: () => void;
  render: () => Promise<void>;
};

export type SupportedLocale = 'en-US' | 'es-MX';
export type SupportedLanguage = 'en' | 'es';
export type L10n = { locale?: SupportedLocale; language?: SupportedLanguage };
export type Variant = 'modal' | 'drawer' | 'inline';
export type Props =
  | AuthProps
  | FormProps
  | RenderProps
  | VerifyButtonProps
  | VerifyProps;

export enum ComponentKind {
  Auth = 'auth',
  Form = 'form',
  Render = 'render',
  Verify = 'verify',
  VerifyButton = 'verify-button',
}

export type PropsBase = {
  appearance?: Appearance;
  containerId?: string;
  kind: ComponentKind;
  l10n?: L10n;
  variant?: Variant;
  onError?: (error: string) => void;
};

export type Options = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};

export type VerifyAuthToken = {
  authToken: string;
  publicKey?: never;
};

export type VerifyPublicKey = {
  publicKey: string;
  authToken?: never;
};

export type VerifySharedProps = (VerifyAuthToken | VerifyPublicKey) & {
  onCancel?: () => void;
  onClose?: () => void;
  onComplete?: (validationToken: string) => void;
  options?: Options;
  publicKey: string;
  userData?: UserData;
};

export type VerifyProps = PropsBase &
  VerifySharedProps & {
    kind: ComponentKind.Verify;
    variant?: 'modal' | 'drawer';
  };

export type VerifyDataProps = Pick<
  VerifyProps,
  'publicKey' | 'userData' | 'options' | 'authToken' | 'l10n'
>;

export type VerifyButtonProps = PropsBase &
  Partial<VerifySharedProps> & {
    containerId: string;
    dialogVariant?: 'modal' | 'drawer';
    kind: ComponentKind.VerifyButton;
    label?: string;
    onClick?: () => void;
    variant: 'inline';
  };

export type VerifyButtonDataProps = Pick<VerifyButtonProps, 'label'> &
  VerifyDataProps;

export type RenderProps = PropsBase & {
  authToken: string;
  canCopy?: boolean;
  containerId: string;
  defaultHidden?: boolean;
  id: string; // a valid data identifier
  kind: ComponentKind.Render;
  label?: string; // defaults to a nice string chosen for that data identifier
  showHiddenToggle?: boolean;
  variant: 'inline';
};

export type RenderDataProps = Pick<
  RenderProps,
  | 'authToken'
  | 'canCopy'
  | 'defaultHidden'
  | 'id'
  | 'label'
  | 'showHiddenToggle'
>;

export type FormOptions = {
  hideButtons?: boolean;
  hideCancelButton?: boolean;
  hideFootprintLogo?: boolean;
};

export type FormRef = {
  save: () => Promise<void>;
};

export type FormProps = PropsBase & {
  authToken: string;
  containerId?: string; // required for inline variant
  getRef?: (ref: FormRef) => void; // returns a ref on mount that the tenants can trigger form actions from
  kind: ComponentKind.Form;
  onCancel?: () => void;
  onClose?: () => void;
  onComplete?: () => void;
  options?: FormOptions;
  title?: string;
  variant?: Variant; // supports all variants, falls back to modal, so optional
};

export type FormDataProps = Pick<
  FormProps,
  'authToken' | 'options' | 'title' | 'l10n'
>;

export type AuthProps = PropsBase & {
  kind: ComponentKind.Auth;
  onCancel?: () => void;
  onClose?: () => void;
  onComplete?: (validationToken: string) => void;
  options?: Pick<Options, 'showLogo'>;
  publicKey: string;
  userData?: Pick<UserData, 'id.email' | 'id.phone_number'>;
  variant?: 'modal' | 'drawer';
};

export type AuthDataProps = Pick<
  AuthProps,
  'publicKey' | 'userData' | 'options' | 'l10n'
>;
