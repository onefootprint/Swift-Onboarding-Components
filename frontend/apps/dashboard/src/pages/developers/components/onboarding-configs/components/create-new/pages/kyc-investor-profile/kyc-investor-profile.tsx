import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CollectedInvestorProfileDataOption } from '@onefootprint/types';
import { Checkbox, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useOnboardingConfigMachine } from '../../components/machine-provider';
import getFormIdForState from '../../utils/get-form-id-for-state';
import InvestorProfileForm from './components/investor-profile-form';

type FormData = {
  shouldCollect: boolean;
};

const KycInvestorProfile = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create-new.kyc-investor-profile',
  );
  const [state, send] = useOnboardingConfigMachine();
  const { kycInvestorProfile } = state.context;
  const methods = useForm<FormData>({
    defaultValues: {
      shouldCollect: kycInvestorProfile?.investor_profile || false,
    },
  });
  const { handleSubmit, register, watch } = methods;
  const investorProfileQuestionsVisible = watch('shouldCollect');

  const handleBeforeSubmit = (formData: FormData) => {
    send({
      type: 'kycInvestorProfileSubmitted',
      payload: {
        [CollectedInvestorProfileDataOption.investorProfile]:
          formData.shouldCollect,
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <Form
        data-testid="kyc-investor-profile-form"
        id={getFormIdForState(state.value)}
        onSubmit={handleSubmit(handleBeforeSubmit)}
      >
        <Section>
          <SectionTitle>
            <Typography variant="label-2">{t('title')}</Typography>
            <Typography variant="body-3">{t('description')}</Typography>
          </SectionTitle>
          <SectionContent>
            <Checkbox label={t('label')} {...register('shouldCollect')} />
            <InvestorProfileForm isExpanded={investorProfileQuestionsVisible} />
          </SectionContent>
        </Section>
      </Form>
    </FormProvider>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const SectionTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

const SectionContent = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

export default KycInvestorProfile;
