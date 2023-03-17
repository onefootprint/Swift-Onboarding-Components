import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
  InvestorProfileEmployedByBrokerage,
} from '@onefootprint/types';
import { Radio, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button';
import { EmployedByBrokerageData } from '../../../../utils/state-machine/types';

export type BrokerageEmploymentFormProps = {
  defaultValues?: Pick<
    InvestorProfileData,
    | InvestorProfileDataAttribute.employedByBrokerage
    | InvestorProfileDataAttribute.employedByBrokerageFirm
  >;
  isLoading?: boolean;
  onSubmit: (data: EmployedByBrokerageData) => void;
};

const BrokerageEmploymentForm = ({
  defaultValues,
  isLoading,
  onSubmit,
}: BrokerageEmploymentFormProps) => {
  const { t } = useTranslation('pages.brokerage-employment.form');
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<EmployedByBrokerageData>({
    defaultValues,
  });
  const status = watch(InvestorProfileDataAttribute.employedByBrokerage);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <OptionsContainer data-private>
        <Radio
          value={InvestorProfileEmployedByBrokerage.no}
          label={t('status.no')}
          {...register(InvestorProfileDataAttribute.employedByBrokerage)}
        />
        <Radio
          value={InvestorProfileEmployedByBrokerage.yes}
          label={t('status.yes')}
          {...register(InvestorProfileDataAttribute.employedByBrokerage)}
        />
      </OptionsContainer>
      {status === InvestorProfileEmployedByBrokerage.yes && (
        <TextInput
          data-private
          hasError={
            !!errors[InvestorProfileDataAttribute.employedByBrokerageFirm]
          }
          hint={
            errors[InvestorProfileDataAttribute.employedByBrokerageFirm]
              ? t('firm.error')
              : undefined
          }
          placeholder={t('firm.placeholder')}
          label={t('firm.label')}
          {...register(InvestorProfileDataAttribute.employedByBrokerageFirm, {
            required: true,
          })}
        />
      )}
      <ContinueButton isLoading={isLoading} />
    </Form>
  );
};

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[6]};
  `}
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default BrokerageEmploymentForm;
