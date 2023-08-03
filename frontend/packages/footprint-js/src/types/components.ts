import { Appearance } from './appearance';
import { FootprintUserData as UserData } from './user-data';

export interface Footprint {
  init: (props: Props) => Component;
}

export interface Component {
  render: () => Promise<void>;
  destroy: () => void;
}

export type Props = FormProps | VerifyButtonProps | VerifyProps | RenderProps;

export enum ComponentKind {
  Form = 'form',
  VerifyButton = 'verify-button',
  Verify = 'verify',
  Render = 'render',
}

export type Variant = ModalVariant | DrawerVariant | InlineVariant;
export type ModalVariant = 'modal';
export type DrawerVariant = 'drawer';
export type InlineVariant = {
  containerId: string;
};

export interface PropsBase {
  kind: ComponentKind;
  appearance?: Appearance;
  variant?: Variant;
}

export type VerifyOptions = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};

export interface VerifyProps extends PropsBase {
  kind: ComponentKind.Verify;
  variant?: ModalVariant | DrawerVariant;
  publicKey: string;
  userData?: UserData;
  options?: VerifyOptions;
  onComplete?: (validationToken: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export interface VerifyButtonProps extends PropsBase {
  kind: ComponentKind.VerifyButton;
  variant: InlineVariant; // We require a containerId
  dialogVariant?: ModalVariant | DrawerVariant;
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
  variant: InlineVariant; // We require a containerId
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
}
