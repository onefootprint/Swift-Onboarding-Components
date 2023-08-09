import getCustomAppearance from '@onefootprint/appearance';
import {
  FootprintFormType,
  FootprintPrivateEvent,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import { CardDIField } from '@onefootprint/types';
import type { GetServerSideProps } from 'next';
import React, { useRef } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useFootprintProvider } from '../../components/footprint-provider';
import useProps from '../../components/footprint-provider/hooks/use-props';
import FormBase, { FormBaseHandler, FormData } from './components/form-base';
import Invalid from './components/invalid';
import Loading from './components/loading';
import useClientTokenFields from './hooks/use-client-token-fields';
import useUsersVault from './hooks/use-users-vault';
import { FootprintFormDataProps } from './types';
import arePropsValid from './utils/are-props-valid';
import checkIsExpired from './utils/check-is-expired';
import getCardAlias from './utils/get-card-alias';
import validateClientTokenFields from './utils/validate-client-token-fields';

const Form = () => {
  const footprintProvider = useFootprintProvider();
  const formBaseRef = useRef<FormBaseHandler>(null);
  const props = useProps<FootprintFormDataProps>();
  const {
    authToken = '',
    title,
    type = FootprintFormType.cardAndName,
    variant,
    options,
  } = props || {};
  const usersVaultMutation = useUsersVault();
  const clientTokenFields = useClientTokenFields(authToken);

  const subscribeSave = () =>
    footprintProvider.on(FootprintPrivateEvent.formSaved, () => {
      formBaseRef.current?.save();
    });

  useEffectOnce(() => {
    subscribeSave();
  });

  if (!props || !clientTokenFields.data) {
    return <Loading />;
  }

  const handleCancel = () => {
    footprintProvider.send(FootprintPublicEvent.canceled);
  };

  const handleClose = () => {
    footprintProvider.send(FootprintPublicEvent.closed);
  };

  const isValid = arePropsValid(props);
  const { vaultFields, expiresAt } = clientTokenFields.data;
  const hasPermissions = validateClientTokenFields(type, vaultFields);
  const isExpired = checkIsExpired(expiresAt);
  if (!isValid || !hasPermissions || isExpired) {
    return <Invalid onClose={handleClose} />;
  }

  const handleSave = async (formData: FormData) => {
    const cardAlias = getCardAlias(vaultFields);
    if (!cardAlias) {
      return;
    }

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
          footprintProvider.send(FootprintPublicEvent.completed);
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
    <FormBase
      ref={formBaseRef}
      title={title}
      type={type}
      variant={variant}
      isLoading={usersVaultMutation.isLoading}
      hideFootprintLogo={options?.hideFootprintLogo}
      hideButtons={options?.hideButtons}
      onSave={handleSave}
      onCancel={handleCancel}
      onClose={handleClose}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  res,
  query,
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=3600',
  );

  const params = query as Record<string, string>;
  const { theme, fontSrc, rules, variant } = await getCustomAppearance({
    strategy: ['queryParameters'],
    params,
    variant: params.variant,
  });
  return { props: { theme, fontSrc, rules, variant } };
};

export default Form;
