import { CardDIField } from '@onefootprint/types';
import React from 'react';

import useProps from '../../hooks/use-props';
import Form, { FormData } from './components/form';
import useUsersVault from './hooks/use-users-vault';
import { SecureFormProps } from './types';

const SecureForm = () => {
  const usersVaultMutation = useUsersVault();

  const props = useProps<SecureFormProps>();
  if (!props) {
    throw new Error('SecureForm received empty props');
  }

  const {
    authToken,
    cardAlias,
    title,
    type,
    variant,
    onSave,
    onCancel,
    onClose,
  } = props;

  const handleSave = (formData: FormData) => {
    // For now, we don't support saving address data
    const values: Record<string, string> = {
      [CardDIField.number]: formData.number.split(' ').join(''),
      [CardDIField.expiration]: formData.expiry,
      [CardDIField.cvc]: formData.cvc,
    };
    if ('name' in formData) {
      values[CardDIField.name] = formData.name;
    }
    const valueMap = Object.entries(values).map(([key, value]) => [
      `card.${cardAlias}.${key}`,
      value,
    ]);
    const data = Object.fromEntries(valueMap);

    usersVaultMutation.mutate(
      {
        authToken,
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
    <Form
      title={title}
      type={type}
      variant={variant}
      onSave={handleSave}
      onCancel={onCancel}
      onClose={onClose}
    />
  );
};

export default SecureForm;
