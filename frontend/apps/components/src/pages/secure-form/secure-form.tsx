import {
  SecureFormDataProps,
  SecureFormEvent,
} from '@onefootprint/footprint-components-js';
import { CardDIField } from '@onefootprint/types';
import React from 'react';

import { useFootprintProvider } from '../../components/footprint-provider';
import useProps from '../../components/footprint-provider/hooks/use-props';
import Form, { FormData } from './components/form';
import Invalid from './components/invalid';
import Loading from './components/loading';
import useUsersVault from './hooks/use-users-vault';
import arePropsValid from './utils/are-props-valid';

const SecureForm = () => {
  const usersVaultMutation = useUsersVault();
  const footprintProvider = useFootprintProvider();
  const props = useProps<SecureFormDataProps>();
  if (!props) {
    return <Loading />;
  }

  const handleCancel = () => {
    footprintProvider.send(SecureFormEvent.secureFormCanceled);
  };

  const handleClose = () => {
    footprintProvider.send(SecureFormEvent.secureFormClosed);
  };

  const isValid = arePropsValid(props);
  if (!isValid) {
    return <Invalid onClose={handleClose} />;
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
    if ('zip' in formData) {
      values[CardDIField.zip] = formData.zip;
    }
    if ('country' in formData) {
      values[CardDIField.country] = formData.country.value;
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
          // eslint-disable-next-line no-console
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
      isLoading={usersVaultMutation.isLoading}
      onSave={handleSave}
      onCancel={handleCancel}
      onClose={handleClose}
    />
  );
};

export default SecureForm;
