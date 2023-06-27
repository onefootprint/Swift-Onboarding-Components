import { CardDI } from '@onefootprint/types';
import React from 'react';

import useProps from '../../hooks/use-props';
import Form, { FormData } from './components/form';
import useUsersVault from './hooks/use-users-vault';
import { SecureFormProps } from './types';

const SecureForm = () => {
  const usersVaultMutation = useUsersVault();

  const props = useProps<SecureFormProps>();
  if (!props) {
    return null;
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
    const data: Partial<Record<CardDI, string>> = {};
    data[`card.${cardAlias}.number`] = formData.number.split(' ').join('');
    data[`card.${cardAlias}.expiration`] = formData.expiry;
    data[`card.${cardAlias}.cvc`] = formData.cvc;
    if ('name' in formData) {
      data[`card.${cardAlias}.name`] = formData.name;
    }

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
