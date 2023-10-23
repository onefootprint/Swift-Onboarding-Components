import type { Appearance } from './appearance';
import type { FootprintUserData as UserData } from './user-data';

export type Footprint = {
  init: (props: Props) => Component;
};

export type Component = {
  render: () => Promise<void>;
  destroy: () => void;
};

export type SupportedLocale = 'en-US' | 'es-MX';
export type L10n = { locale?: SupportedLocale };
export type Props = FormProps | VerifyProps | VerifyButtonProps | RenderProps;

export enum ComponentKind {
  Verify = 'verify',
  Form = 'form',
  Render = 'render',
  VerifyButton = 'verify-button',
}

export type Variant = 'modal' | 'drawer' | 'inline';

export type PropsBase = {
  kind: ComponentKind;
  appearance?: Appearance;
  variant?: Variant;
  containerId?: string;
  l10n?: L10n;
};

export type VerifyOptions = {
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
  userData?: UserData;
  options?: VerifyOptions;
  onComplete?: (validationToken: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
};

export type VerifyProps = PropsBase &
  VerifySharedProps & {
    kind: ComponentKind.Verify;
    variant?: 'modal' | 'drawer';
  };

export type VerifyButtonProps = PropsBase &
  Partial<VerifySharedProps> & {
    kind: ComponentKind.VerifyButton;
    variant: 'inline';
    containerId: string;
    dialogVariant?: 'modal' | 'drawer';
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    label?: string;
  };

export type RenderProps = PropsBase & {
  kind: ComponentKind.Render;
  authToken: string;
  id: string; // a valid data identifier
  label?: string; // defaults to a nice string chosen for that data identifier
  canCopy?: boolean;
  showHiddenToggle?: boolean;
  defaultHidden?: boolean;
  variant: 'inline';
  containerId: string;
};

export type FormOptions = {
  hideFootprintLogo?: boolean;
  hideButtons?: boolean;
};

export type FormRef = {
  save: () => Promise<void>;
};

export type FormProps = PropsBase & {
  kind: ComponentKind.Form;
  authToken: string;
  title?: string;
  containerId?: string; // required for inline variant
  variant?: Variant; // supports all variants, falls back to modal, so optional
  options?: FormOptions;
  getRef?: (ref: FormRef) => void; // returns a ref on mount that the tenants can trigger form actions from
  onComplete?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
};
