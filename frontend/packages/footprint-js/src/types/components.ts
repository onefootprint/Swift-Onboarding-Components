import type { Appearance } from './appearance';
import type { FootprintUserData as UserData } from './user-data';

export enum ComponentKind {
  Auth = 'auth',
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

export type Component = { destroy: () => void; render: () => Promise<void> };
export type Footprint = { init: (props: Props) => Component };

export type Props =
  | AuthProps
  | FormProps
  | RenderProps
  | UpdateLoginMethodsProps
  | VerifyButtonProps
  | VerifyProps;

export type PropsBase = {
  appearance?: Appearance;
  containerId?: string;
  kind: ComponentKind;
  l10n?: L10n;
  onError?: (error: string) => void;
  variant?: Variant;
};

/** verify */
export type VerifyAuthToken = { authToken: string; publicKey?: never };
export type VerifyPublicKey = { publicKey: string; authToken?: never };
type VerifyVariant = 'modal' | 'drawer';
type VerifyPropsBase = PropsBase & {
  onCancel?: () => void;
  onClose?: () => void;
  onComplete?: (validationToken: string) => void;
  options?: Options;
  userData?: UserData;
} & (VerifyAuthToken | VerifyPublicKey);

export type VerifyProps = VerifyPropsBase & {
  kind: ComponentKind.Verify;
  variant?: VerifyVariant;
};

export type VerifyDataProps = Pick<
  VerifyProps,
  'publicKey' | 'userData' | 'options' | 'authToken' | 'l10n'
>;

/** verify-button */
export type VerifyButtonProps = VerifyPropsBase & {
  containerId: string;
  dialogVariant?: VerifyVariant;
  kind: ComponentKind.VerifyButton;
  label?: string;
  onClick?: () => void;
  variant: 'inline';
};
export type VerifyButtonDataProps = Pick<VerifyButtonProps, 'label'> &
  VerifyDataProps;

/** render */
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

/** form */
export type FormRef = { save: () => Promise<void> };
export type FormOptions = {
  hideButtons?: boolean;
  hideCancelButton?: boolean;
  hideFootprintLogo?: boolean;
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

/** auth */
type AuthPropsBase = PropsBase & {
  kind: ComponentKind.Auth;
  onCancel?: () => void;
  onClose?: () => void;
  onComplete?: (validationToken: string) => void;
  options?: Pick<Options, 'showLogo'>;
  userData?: Pick<UserData, 'id.email' | 'id.phone_number'>;
  variant?: 'modal' | 'drawer';
};

export type AuthProps = AuthPropsBase & {
  publicKey?: string;
  authToken?: string;
  /**
   * @deprecated after version 3.9.0
   */
  updateLoginMethods?: true;
};
export type AuthDataProps = Pick<
  AuthProps,
  | 'authToken'
  | 'updateLoginMethods'
  | 'publicKey'
  | 'userData'
  | 'l10n'
  | 'options'
>;

/** update_login_methods */
export type UpdateLoginMethodsProps = PropsBase & {
  kind: ComponentKind.UpdateLoginMethods;
  onCancel?: () => void;
  onClose?: () => void;
  onComplete?: (validationToken: string) => void;
  options?: Pick<Options, 'showLogo'>;
  userData?: Pick<UserData, 'id.email' | 'id.phone_number'>;
  variant?: 'modal' | 'drawer';
  authToken?: string;
};

export type UpdateLoginMethodsDataProps = Pick<
  AuthProps,
  'authToken' | 'userData' | 'l10n' | 'options'
>;
