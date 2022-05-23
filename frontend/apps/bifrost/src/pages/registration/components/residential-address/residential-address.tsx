import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import Header from 'src/components/header';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { Events } from 'src/types/bifrost-machine';
import styled, { css } from 'styled';
import { Button, Grid, Select, TextInput } from 'ui';

type FormData = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
};

const ResidentialAddress = () => {
  const [, send] = useBifrostMachine();
  const { t } = useTranslation('pages.registration.residential-address');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    send({
      type: Events.residentialAddressSubmitted,
      payload: {
        residentialAddress: {
          streetAddress: `${formData.addressLine1}\n${formData.addressLine2}`,
          city: formData.city,
          zipCode: formData.zipCode,
          country: formData.country,
          state: formData.state,
        },
      },
    });
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
      <TextInput
        hasError={!!errors.addressLine1}
        hintText={errors.addressLine1 && t('form.address-line-1.error')}
        label={t('form.address-line-1.label')}
        placeholder={t('form.address-line-1.placeholder')}
        {...register('addressLine1', { required: true })}
      />
      <TextInput
        label={t('form.address-line-2.label')}
        placeholder={t('form.address-line-2.placeholder')}
        {...register('addressLine2')}
      />
      <Grid.Row>
        <Grid.Column col={6}>
          <TextInput
            hasError={!!errors.city}
            hintText={errors.city && t('form.city.error')}
            label={t('form.city.label')}
            placeholder={t('form.city.placeholder')}
            {...register('city', { required: true })}
          />
        </Grid.Column>
        <Grid.Column col={6}>
          <TextInput
            hasError={!!errors.zipCode}
            hintText={errors.zipCode && t('form.zipCode.error')}
            label={t('form.zipCode.label')}
            placeholder={t('form.zipCode.placeholder')}
            {...register('zipCode', { required: true })}
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
