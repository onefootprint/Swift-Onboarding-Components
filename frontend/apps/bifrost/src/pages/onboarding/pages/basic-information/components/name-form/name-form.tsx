import { HeaderTitle } from 'footprint-ui';
import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from 'src/utils/state-machine/onboarding/utils/missing-attributes';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Button, Grid, TextInput } from 'ui';

import ProgressHeader from '../../../../components/progress-header/progress-header';
import useOnboardingMachine from '../../../../hooks/use-onboarding-machine';

export type NameData = Required<
  Pick<UserData, UserDataAttribute.firstName | UserDataAttribute.lastName>
>;
type FormData = NameData;

export type NameFormProps = {
  isMutationLoading: boolean;
  onSubmit: (data: NameData) => void;
};

const NameForm = ({ isMutationLoading, onSubmit }: NameFormProps) => {
  const { t: cta } = useTranslation('pages.onboarding.cta');
  const { t } = useTranslation('pages.onboarding.basic-information');
  const [state] = useOnboardingMachine();
  const { data, missingAttributes } = state.context;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.firstName]: data[UserDataAttribute.firstName],
      [UserDataAttribute.lastName]: data[UserDataAttribute.lastName],
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      firstName: formData.firstName,
      lastName: formData.lastName,
    };
    onSubmit(basicInformation);
  };

  const hasOtherMissingAttributes =
    isMissingResidentialAttribute(missingAttributes) ||
    isMissingSsnAttribute(missingAttributes);

  return (
    <>
      <ProgressHeader />
      <Form onSubmit={handleSubmit(onSubmitFormData)}>
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
        <Button type="submit" fullWidth loading={isMutationLoading}>
          {hasOtherMissingAttributes ? cta('continue') : cta('complete')}
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

export default NameForm;
