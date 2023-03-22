import { useTranslation } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDI,
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
  defaultValues?: Pick<InvestorProfileData, InvestorProfileDI.netWorth>;
  onSubmit: (data: NetWorthData) => void;
};

type FormData = {
  netWorth: InvestorProfileNetWorth;
};

const NetWorthForm = ({
  isLoading,
  defaultValues,
  onSubmit,
}: NetWorthFormProps) => {
  const { t } = useTranslation('pages.net-worth.form');
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      netWorth:
        defaultValues?.[InvestorProfileDI.netWorth] ??
        InvestorProfileNetWorth.lt50k,
    },
  });

  const handleBeforeSubmit = (data: FormData) => {
    const { netWorth } = data;
    onSubmit({
      [InvestorProfileDI.netWorth]: netWorth,
    });
  };

  return (
    <Form onSubmit={handleSubmit(handleBeforeSubmit)}>
      <OptionsContainer data-private>
        <Radio
          value={InvestorProfileNetWorth.lt50k}
          label={t(`${InvestorProfileNetWorth.lt50k}`)}
          {...register('netWorth')}
        />
        <Radio
          value={InvestorProfileNetWorth.s50kTo100k}
          label={t(`${InvestorProfileNetWorth.s50kTo100k}`)}
          {...register('netWorth')}
        />
        <Radio
          value={InvestorProfileNetWorth.s100kTo250k}
          label={t(`${InvestorProfileNetWorth.s100kTo250k}`)}
          {...register('netWorth')}
        />
        <Radio
          value={InvestorProfileNetWorth.s250kTo500k}
          label={t(`${InvestorProfileNetWorth.s250kTo500k}`)}
          {...register('netWorth')}
        />
        <Radio
          value={InvestorProfileNetWorth.S500kTo1m}
          label={t(`${InvestorProfileNetWorth.S500kTo1m}`)}
          {...register('netWorth')}
        />
        <Radio
          value={InvestorProfileNetWorth.gt1m}
          label={t(`${InvestorProfileNetWorth.gt1m}`)}
          {...register('netWorth')}
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
