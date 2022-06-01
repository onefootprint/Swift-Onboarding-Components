import { useInputMask, useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Events, UserData, UserDataAttribute } from 'src/bifrost-machine/types';
import Header from 'src/components/header';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import styled, { css } from 'styled';
import { Button, Grid, TextInput } from 'ui';

import useSyncData from '../../hooks/use-sync-data';

type FormData = Required<
  Pick<
    UserData,
    | UserDataAttribute.firstName
    | UserDataAttribute.lastName
    | UserDataAttribute.dob
  >
>;

const BasicInformation = () => {
  const inputMasks = useInputMask('en');
  const [, send] = useBifrostMachine();
  const syncDataMutation = useSyncData();
  const { t } = useTranslation('pages.registration.basic-information');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    const basicInformation = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
    };
    send({
      type: Events.basicInformationSubmitted,
      payload: {
        basicInformation,
      },
    });
    syncDataMutation(basicInformation);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Grid.Row>
        <Grid.Column col={6}>
          <TextInput
            hasError={!!errors.firstName}
            hintText={errors.firstName && t('form.first-name.error')}
            label={t('form.first-name.label')}
            placeholder={t('form.first-name.placeholder')}
            {...register('firstName', { required: true })}
          />
        </Grid.Column>
        <Grid.Column col={6}>
          <TextInput
            hasError={!!errors.lastName}
            hintText={errors.lastName && t('form.last-name.error')}
            label={t('form.last-name.label')}
            placeholder={t('form.last-name.placeholder')}
            {...register('lastName', { required: true })}
          />
        </Grid.Column>
      </Grid.Row>
      <TextInput
        hasError={!!errors.dob}
        hintText={errors.dob && t('form.dob.error')}
        label={t('form.dob.label')}
        mask={inputMasks.dob}
        placeholder={t('form.dob.placeholder')}
        {...register('dob', { required: true })}
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

export default BasicInformation;
