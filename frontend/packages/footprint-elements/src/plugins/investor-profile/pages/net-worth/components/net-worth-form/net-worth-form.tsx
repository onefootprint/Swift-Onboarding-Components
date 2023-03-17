import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
  InvestorProfileNetWorth,
} from '@onefootprint/types';
import { Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import ContinueButton from '../../../../components/continue-button';
import { NetWorthData } from '../../../../utils/state-machine/types';

export type NetWorthFormProps = {
  isLoading?: boolean;
  defaultValues?: Pick<
    InvestorProfileData,
    InvestorProfileDataAttribute.netWorth
  >;
  onSubmit: (data: NetWorthData) => void;
};

const NetWorthForm = ({
  isLoading,
  defaultValues,
  onSubmit,
}: NetWorthFormProps) => {
  const { t } = useTranslation('pages.net-worth.form');
  const { handleSubmit, register } = useForm<NetWorthData>({
    defaultValues,
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <OptionsContainer data-private>
        <Radio
          value={InvestorProfileNetWorth.tt50k}
          label={t(`${InvestorProfileNetWorth.tt50k}`)}
          {...register(InvestorProfileDataAttribute.netWorth)}
        />
        <Radio
          value={InvestorProfileNetWorth.s50kTo100k}
          label={t(`${InvestorProfileNetWorth.s50kTo100k}`)}
          {...register(InvestorProfileDataAttribute.netWorth)}
        />
        <Radio
          value={InvestorProfileNetWorth.s100kTo250k}
          label={t(`${InvestorProfileNetWorth.s100kTo250k}`)}
          {...register(InvestorProfileDataAttribute.netWorth)}
        />
        <Radio
          value={InvestorProfileNetWorth.s250kTo500k}
          label={t(`${InvestorProfileNetWorth.s250kTo500k}`)}
          {...register(InvestorProfileDataAttribute.netWorth)}
        />
        <Radio
          value={InvestorProfileNetWorth.S500kTo1m}
          label={t(`${InvestorProfileNetWorth.S500kTo1m}`)}
          {...register(InvestorProfileDataAttribute.netWorth)}
        />
        <Radio
          value={InvestorProfileNetWorth.Gt1m}
          label={t(`${InvestorProfileNetWorth.Gt1m}`)}
          {...register(InvestorProfileDataAttribute.netWorth)}
        />
      </OptionsContainer>
      <ContinueButton isLoading={isLoading} />
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[6]};
  `}
`;

export default NetWorthForm;
