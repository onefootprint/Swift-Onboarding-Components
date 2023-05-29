import { CardDI } from '@onefootprint/types';
import React from 'react';
import SecureForm, {
  SecureFormData,
  SecureFormType,
  SecureFormVariant,
} from 'src/components/secure-form';

import useUsersVault from './hooks/use-users-vault';

export type FootprintFormProps = {
  authToken: string;
  cardName: string;
  title?: string;
  // For now, we don't support collecting address data
  type?: Omit<SecureFormType, 'cardAndNameAndAddress'>;
  variant?: SecureFormVariant;
  onSave?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
};

const FootprintForm = ({
  authToken,
  cardName,
  title,
  type,
  variant,
  onSave,
  onCancel,
  onClose,
}: FootprintFormProps) => {
  const usersVaultMutation = useUsersVault();

  const handleSave = (formData: SecureFormData) => {
    // For now, we don't support saving address data
    const data: Partial<Record<CardDI, string>> = {
      [CardDI.number]: formData.number.split(' ').join(''),
      [CardDI.expiration]: formData.expiry,
      [CardDI.cvc]: formData.cvc,
    };
    if ('name' in formData) {
      data[CardDI.name] = formData.name;
    }

    usersVaultMutation.mutate(
      {
        authToken,
        cardName,
        data,
      },
      {
        onSuccess: () => {
          onSave?.();
        },
        onError: (error: unknown) => {
          console.error(
            'Encountered error while saving user data to vault: ',
            error,
          );
        },
      },
    );
  };

  return (
    <SecureForm
      title={title}
      type={type as SecureFormType}
      variant={variant}
      onSave={handleSave}
      onCancel={onCancel}
      onClose={onClose}
    />
  );
};

export default FootprintForm;
