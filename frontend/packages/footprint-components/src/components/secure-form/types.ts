// TODO: add appearance support
// https://linear.app/footprint/issue/FP-4516/add-appearance-support-for-secureform-and-securerender

export enum SecureFormType {
  cardOnly = 'cardOnly',
  cardAndName = 'cardAndName',
  cardAndNameAndAddress = 'cardAndNameAndAddress',
}

export type SecureFormVariant = 'modal' | 'card';

export type SecureFormProps = {
  authToken: string;
  cardAlias: string;
  title?: string;
  type?: SecureFormType;
  variant?: SecureFormVariant;
  onSave?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
};
