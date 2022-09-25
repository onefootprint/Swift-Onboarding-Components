import { UserDataAttribute } from '@onefootprint/types';
import { HeaderTitle } from 'footprint-elements';
import { useInputMask, useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import useOnboardingMachine from 'src/pages/onboarding/hooks/use-onboarding-machine';
import {
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from 'src/utils/state-machine/onboarding/utils/missing-attributes';
import { NameAndDobInformation } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Button, Grid, TextInput } from 'ui';

import NavigationHeader from '../../../../components/navigation-header/navigation-header';
import validateDob from '../../utils/validate-dob/validate-dob';

type FormData = NameAndDobInformation;

export type NameAndDobFormProps = {
  isMutationLoading: boolean;
  onSubmit: (data: NameAndDobInformation) => void;
};

const NameAndDobForm = ({
  isMutationLoading,
  onSubmit,
}: NameAndDobFormProps) => {
  const { t: cta } = useTranslation('pages.onboarding.cta');
  const { t } = useTranslation('pages.onboarding.basic-information');
  const inputMasks = useInputMask('en-US');
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
      [UserDataAttribute.dob]: data[UserDataAttribute.dob],
    },
  });

  const onSubmitFormData = (formData: FormData) => {
    const basicInformation = {
      [UserDataAttribute.firstName]: formData[UserDataAttribute.firstName],
      [UserDataAttribute.lastName]: formData[UserDataAttribute.lastName],
      [UserDataAttribute.dob]: formData[UserDataAttribute.dob],
    };
    onSubmit(basicInformation);
  };

  const hasOtherMissingAttributes =
    isMissingResidentialAttribute(missingAttributes) ||
    isMissingSsnAttribute(missingAttributes);

  return (
    <>
      <NavigationHeader />
      <Form onSubmit={handleSubmit(onSubmitFormData)}>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <Grid.Row>
          <Grid.Column col={6}>
            <TextInput
              hasError={!!errors[UserDataAttribute.firstName]}
              hint={
                errors[UserDataAttribute.firstName] &&
                t('form.first-name.error')
              }
              label={t('form.first-name.label')}
              placeholder={t('form.first-name.placeholder')}
              {...register(UserDataAttribute.firstName, { required: true })}
            />
          </Grid.Column>
          <Grid.Column col={6}>
            <TextInput
              hasError={!!errors[UserDataAttribute.lastName]}
              hint={
                errors[UserDataAttribute.lastName] && t('form.last-name.error')
              }
              label={t('form.last-name.label')}
              placeholder={t('form.last-name.placeholder')}
              {...register(UserDataAttribute.lastName, { required: true })}
            />
          </Grid.Column>
        </Grid.Row>
        <TextInput
          hasError={!!errors[UserDataAttribute.dob]}
          hint={errors[UserDataAttribute.dob] && t('form.dob.error')}
          label={t('form.dob.label')}
          mask={inputMasks.dob}
          placeholder={t('form.dob.placeholder')}
          {...register(UserDataAttribute.dob, {
            required: true,
            validate: validateDob,
          })}
        />
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

export default NameAndDobForm;
