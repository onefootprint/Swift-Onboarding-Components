import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Events, UserData, UserDataAttribute } from 'src/bifrost-machine/types';
import Header from 'src/components/header';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import styled, { css } from 'styled';
import { AddressInput, Button, Grid, Select, TextInput } from 'ui';

import useSyncData from '../../hooks/use-sync-data';

type FormData = Required<
  Pick<
    UserData,
    | UserDataAttribute.streetAddress
    | UserDataAttribute.streetAddress2
    | UserDataAttribute.city
    | UserDataAttribute.state
    | UserDataAttribute.country
    | UserDataAttribute.zip
  >
>;

const ResidentialAddress = () => {
  const [, send] = useBifrostMachine();
  const syncDataMutation = useSyncData();
  const { t } = useTranslation('pages.registration.residential-address');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    const residentialAddress = {
      streetAddress: formData.streetAddress,
      streetAddress2: formData.streetAddress2,
      city: formData.city,
      zip: formData.zip,
      country: 'United States', // formData.country,
      state: 'CA', // formData.state,
    };
    send({
      type: Events.residentialAddressSubmitted,
      payload: {
        residentialAddress,
      },
    });
    syncDataMutation(residentialAddress);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Select
        label={t('form.country.label')}
        onSelect={() => {}}
        options={[{ label: 'United States', value: 'US' }]}
        placeholder={t('form.country.placeholder')}
      />
      <AddressInput
        hasError={!!errors.streetAddress}
        hintText={errors.streetAddress && t('form.address-line-1.error')}
        label={t('form.address-line-1.label')}
        placeholder={t('form.address-line-1.placeholder')}
        {...register(UserDataAttribute.streetAddress, { required: true })}
      />
      <TextInput
        label={t('form.address-line-2.label')}
        placeholder={t('form.address-line-2.placeholder')}
        {...register(UserDataAttribute.streetAddress2)}
      />
      <Grid.Row>
        <Grid.Column col={6}>
          <TextInput
            hasError={!!errors.city}
            hintText={errors.city && t('form.city.error')}
            label={t('form.city.label')}
            placeholder={t('form.city.placeholder')}
            {...register(UserDataAttribute.city, { required: true })}
          />
        </Grid.Column>
        <Grid.Column col={6}>
          <TextInput
            hasError={!!errors.zip}
            hintText={errors.zip && t('form.zipCode.error')}
            label={t('form.zipCode.label')}
            placeholder={t('form.zipCode.placeholder')}
            {...register(UserDataAttribute.zip, { required: true })}
          />
        </Grid.Column>
      </Grid.Row>
      <Select
        label={t('form.state.label')}
        onSelect={() => {}}
        options={[{ label: 'California', value: 'CA' }]}
        placeholder={t('form.state.placeholder')}
      />
      <Button type="submit" fullWidth>
        {t('form.cta')}
      </Button>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default ResidentialAddress;
