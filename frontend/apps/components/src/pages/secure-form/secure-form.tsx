import {
  SecureFormDataProps,
  SecureFormEvent,
} from '@onefootprint/footprint-components-js';
import { CardDIField } from '@onefootprint/types';
import React from 'react';

import { useFootprintProvider } from '../../components/footprint-provider';
import useProps from '../../components/footprint-provider/hooks/use-props';
import Form, { FormData } from './components/form';
import useUsersVault from './hooks/use-users-vault';

const SecureForm = () => {
  const usersVaultMutation = useUsersVault();
  const props = useProps<SecureFormDataProps>();
  const footprintProvider = useFootprintProvider();
  if (!props) {
    // TODO: create shimmer here
    return null;
  }

  const { authToken, cardAlias, title, type, variant } = props;

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
          footprintProvider.send(SecureFormEvent.secureFormSaved);
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

  const handleCancel = () => {
    footprintProvider.send(SecureFormEvent.secureFormCanceled);
  };

  const handleClose = () => {
    footprintProvider.send(SecureFormEvent.secureFormClosed);
  };

  return (
    <Form
      title={title}
      type={type}
      variant={variant}
      onSave={handleSave}
      onCancel={handleCancel}
      onClose={handleClose}
    />
  );
};

export default SecureForm;
