import { FootprintAppearance } from './appearance';

export enum SecureFormType {
  cardOnly = 'cardOnly',
  cardAndName = 'cardAndName',
  cardAndNameAndAddress = 'cardAndNameAndAddress',
  cardAndZip = 'cardAndZip',
}

export type SecureFormVariant = 'modal' | 'card' | 'drawer';

export type SecureFormProps = {
  appearance?: FootprintAppearance;
} & SecureFormDataProps &
  SecureFormCallbacks;

export type SecureFormDataProps = {
  authToken: string;
  cardAlias: string;
  title?: string;
  type?: SecureFormType;
  variant?: SecureFormVariant;
};

export type SecureFormCallbacks = {
  onSave?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
};
