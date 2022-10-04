import { useTranslation } from '@onefootprint/hooks';
import { UserData, UserDataAttribute } from '@onefootprint/types';
import { Button, Grid, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../../../components/header-title';
import { useCollectKycDataMachine } from '../../../../components/machine-provider';
import NavigationHeader from '../../../../components/navigation-header/navigation-header';
import {
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from '../../../../utils/missing-attributes';

export type NameData = Required<
  Pick<UserData, UserDataAttribute.firstName | UserDataAttribute.lastName>
>;
type FormData = NameData;

export type NameFormProps = {
  isMutationLoading: boolean;
  onSubmit: (data: NameData) => void;
  ctaLabel?: string;
};

const NameForm = ({ isMutationLoading, ctaLabel, onSubmit }: NameFormProps) => {
  const { t: cta } = useTranslation('pages.cta');
  const { t } = useTranslation('pages.basic-information');
  const [state] = useCollectKycDataMachine();
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
      [UserDataAttribute.firstName]: formData[UserDataAttribute.firstName],
      [UserDataAttribute.lastName]: formData[UserDataAttribute.lastName],
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
        <Button type="submit" fullWidth loading={isMutationLoading}>
          {ctaLabel ??
            (hasOtherMissingAttributes ? cta('continue') : cta('complete'))}
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
