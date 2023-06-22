import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import AnimatedContainer from 'src/components/animated-container';
import styled, { css } from 'styled-components';

import FormTitle from '../../components/form-title';
import { useOnboardingConfigMachine } from '../../components/machine-provider';
import getDefaultKycAccess from '../../utils/get-default-kyc-access';
import getFormIdForState from '../../utils/get-form-id-for-state';

type FormData = Record<
  | CollectedKycDataOption
  | CollectedDocumentDataOption
  | CollectedInvestorProfileDataOption,
  boolean
>;

const KycAccess = () => {
  const [state, send] = useOnboardingConfigMachine();
  const { kycCollect, kycAccess } = state.context;
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create.kyc-access-form',
  );

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: getDefaultKycAccess(kycCollect, kycAccess),
  });
  const idDocAccess = watch(CollectedDocumentDataOption.document);

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      setValue(CollectedDocumentDataOption.documentAndSelfie, false);
    }
  };

  const handleBeforeSubmit = (formData: FormData) => {
    send({
      type: 'kycAccessSubmitted',
      payload: {
        ...formData,
      },
    });
  };

  return (
    <>
      <FormTitle title={t('title')} description={t('description')} />
      <Form
        id={getFormIdForState(state.value)}
        data-testid={getFormIdForState(state.value)}
        onSubmit={handleSubmit(handleBeforeSubmit)}
      >
        <OptionsContainer>
          <Checkbox
            label={allT('cdo.email')}
            {...register(CollectedKycDataOption.email)}
          />
          <Checkbox
            label={allT('cdo.phone_number')}
            {...register(CollectedKycDataOption.phoneNumber)}
          />
          <Checkbox
            label={allT('cdo.name')}
            {...register(CollectedKycDataOption.name)}
          />
          <Checkbox
            label={allT('cdo.dob')}
            {...register(CollectedKycDataOption.dob)}
          />
          <Checkbox
            label={allT('cdo.full_address')}
            {...register(CollectedKycDataOption.fullAddress)}
          />
          {kycCollect?.ssnKind === CollectedKycDataOption.ssn4 && (
            <Checkbox
              label={allT('cdo.ssn4')}
              {...register(CollectedKycDataOption.ssn4)}
            />
          )}
          {kycCollect?.ssnKind === CollectedKycDataOption.ssn9 && (
            <Checkbox
              label={allT('cdo.ssn9')}
              {...register(CollectedKycDataOption.ssn9)}
            />
          )}
          {kycCollect?.[CollectedKycDataOption.nationality] && (
            <Checkbox
              label={allT('cdo.nationality')}
              {...register(CollectedKycDataOption.nationality)}
            />
          )}
          {kycCollect?.[CollectedDocumentDataOption.document] && (
            <Box>
              <Checkbox
                label={allT('cdo.document')}
                {...register(CollectedDocumentDataOption.document, {
                  onChange: handleDocumentChange,
                })}
              />
              <AnimatedContainer
                isExpanded={
                  !!kycCollect?.[
                    CollectedDocumentDataOption.documentAndSelfie
                  ] && !!idDocAccess
                }
                sx={{ marginLeft: 5, marginTop: 3 }}
              >
                <Checkbox
                  label={allT('cdo.selfie')}
                  {...register(CollectedDocumentDataOption.documentAndSelfie)}
                />
              </AnimatedContainer>
            </Box>
          )}
          {kycCollect?.[CollectedInvestorProfileDataOption.investorProfile] && (
            <Checkbox
              label={allT('cdo.investor_profile')}
              {...register(CollectedInvestorProfileDataOption.investorProfile)}
            />
          )}
        </OptionsContainer>
      </Form>
    </>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default KycAccess;
