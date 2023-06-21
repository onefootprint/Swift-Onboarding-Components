/* eslint-disable @typescript-eslint/no-unused-vars */
import { CountrySelectOption, SelectOption } from '@onefootprint/ui';
import React from 'react';

import { SecureFormType, SecureFormVariant } from '../../types';

export type AddressData = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string | SelectOption;
  country: CountrySelectOption;
  zip: string;
};

export type CardData = {
  number: string;
  expiry: string;
  cvc: string;
};

export type NameData = {
  name: string;
};

export type FormData =
  | CardData
  | (CardData & NameData)
  | (CardData & NameData & AddressData);

export type FormProps = {
  title?: string;
  type?: SecureFormType;
  variant?: SecureFormVariant;
  onSave?: (data: FormData) => void;
  onCancel?: () => void;
  onClose?: () => void;
};

const Form = ({
  title,
  type = SecureFormType.cardAndName,
  variant = 'modal',
  onSave,
  onCancel,
  onClose,
}: FormProps) => <div>TODO</div>;

export default Form;
