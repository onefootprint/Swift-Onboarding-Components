import { Appearance } from './appearance';
import { FootprintUserData as UserData } from './user-data';

export interface Footprint {
  init: (props: Props) => Component;
}

export interface Component {
  render: () => Promise<void>;
  destroy: () => void;
}

export type Props = FormProps | VerifyProps | VerifyButtonProps | RenderProps;

export enum ComponentKind {
  Verify = 'verify',
  Form = 'form',
  Render = 'render',
  VerifyButton = 'verify-button',
}

export type Variant = 'modal' | 'drawer' | 'inline';

export interface PropsBase {
  kind: ComponentKind;
  appearance?: Appearance;
  variant?: Variant;
  containerId?: string;
}

export type VerifyOptions = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};

export interface VerifyProps extends PropsBase {
  kind: ComponentKind.Verify;
  variant?: 'modal' | 'drawer';
  publicKey: string;
  userData?: UserData;
  options?: VerifyOptions;
  onComplete?: (validationToken: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export interface VerifyButtonProps extends PropsBase {
  kind: ComponentKind.VerifyButton;
  variant: 'inline';
  containerId: string;
  dialogVariant?: 'modal' | 'drawer';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  publicKey?: string;
  userData?: UserData;
  options?: VerifyOptions;
  onComplete?: (validationToken: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export interface RenderProps extends PropsBase {
  kind: ComponentKind.Render;
  authToken: string;
  id: string; // a valid data identifier
  label?: string; // defaults to a nice string chosen for that data identifier
  canCopy?: boolean;
  showHiddenToggle?: boolean;
  defaultHidden?: boolean;
  variant: 'inline';
  containerId: string;
}

export enum FormType {
  cardOnly = 'cardOnly',
  cardAndName = 'cardAndName',
  cardAndNameAndAddress = 'cardAndNameAndAddress',
  cardAndZip = 'cardAndZip',
}

export interface FormProps extends PropsBase {
  kind: ComponentKind.Form;
  authToken: string;
  title?: string;
  type?: FormType;
  onComplete?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  variant?: Variant; // supports all variants, falls back to modal, so optional
  containerId?: string; // required for inline variant
}
