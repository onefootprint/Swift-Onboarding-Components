import { HeaderTitle } from 'footprint-ui';
import { useInputMask, useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Events } from 'src/utils/state-machine/onboarding';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Button, Grid, TextInput } from 'ui';
import useToast from 'ui/src/components/toast/hooks/use-toast';

import useSyncData from '../../../../hooks/use-sync-data';
import ProgressHeader from '../../components/progress-header';
import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import validateDob from './utils/validate-dob';

type FormData = Required<
  Pick<
    UserData,
    | UserDataAttribute.firstName
    | UserDataAttribute.lastName
    | UserDataAttribute.dob
  >
>;

const BasicInformation = () => {
  const inputMasks = useInputMask('en-US');
  const [state, send] = useOnboardingMachine();
  const { data, authToken } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { t } = useTranslation('pages.registration.basic-information');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.firstName]: data[UserDataAttribute.firstName],
      [UserDataAttribute.lastName]: data[UserDataAttribute.lastName],
      [UserDataAttribute.dob]: data[UserDataAttribute.dob],
    },
  });

  const onSubmit = (formData: FormData) => {
    const basicInformation = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
    };

    const handleSuccess = () => {
      send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation,
        },
      });
    };

    const handleError = () => {
      toast.show({
        title: t('sync-data-error.title'),
        description: t('sync-data-error.description'),
        variant: 'error',
      });
    };

    syncData(authToken, basicInformation, {
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  return (
    <>
      <ProgressHeader />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <Grid.Row>
          <Grid.Column col={6}>
            <TextInput
              hasError={!!errors.firstName}
              hintText={errors.firstName && t('form.first-name.error')}
              label={t('form.first-name.label')}
              placeholder={t('form.first-name.placeholder')}
              {...register(UserDataAttribute.firstName, { required: true })}
            />
          </Grid.Column>
          <Grid.Column col={6}>
            <TextInput
              hasError={!!errors.lastName}
              hintText={errors.lastName && t('form.last-name.error')}
              label={t('form.last-name.label')}
              placeholder={t('form.last-name.placeholder')}
              {...register(UserDataAttribute.lastName, { required: true })}
            />
          </Grid.Column>
        </Grid.Row>
        <TextInput
          hasError={!!errors.dob}
          hintText={errors.dob && t('form.dob.error')}
          label={t('form.dob.label')}
          mask={inputMasks.dob}
          placeholder={t('form.dob.placeholder')}
          {...register(UserDataAttribute.dob, {
            required: true,
            validate: validateDob,
          })}
        />
        <Button type="submit" fullWidth loading={mutation.isLoading}>
          {t('form.cta')}
        </Button>
      </Form>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default BasicInformation;
