import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedIdDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox, Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import AnimatedContainer from '../../components/animated-container';
import FormTitle from '../../components/form-title/form-title';
import { useOnboardingConfigMachine } from '../../components/machine-provider';
import getDefaultKycAccess from '../../utils/get-default-kyc-access/get-default-kyc-access';
import getFormIdForState from '../../utils/get-form-id-for-state';

type FormData = {
  allKybData: boolean;
} & Record<
  | CollectedKycDataOption
  | CollectedIdDocumentDataOption
  | CollectedInvestorProfileDataOption,
  boolean
>;

const KybAccess = () => {
  const [state, send] = useOnboardingConfigMachine();
  const { kycCollect, kycAccess, kybAccess } = state.context;
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create-dialog.kyb-access-form',
  );

  const handleBeforeSubmit = (formData: FormData) => {
    // Remove the allKybData field
    const kycAccessFormData = (({ allKybData, ...o }) => o)(formData);
    send({
      type: 'kybAccessSubmitted',
      payload: {
        allKybData: formData.allKybData,
        kycAccess: kycAccessFormData,
      },
    });
  };

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      allKybData: kybAccess ? kybAccess.allKybData : true,
      ...getDefaultKycAccess(kycCollect, kycAccess),
    },
  });

  const idDocAccess = watch(CollectedIdDocumentDataOption.document);
  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      setValue(CollectedIdDocumentDataOption.documentAndSelfie, false);
    }
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
            label={t('all-business-info')}
            {...register('allKybData')}
          />
        </OptionsContainer>
        <Divider />
        <OptionsContainer>
          <Typography variant="label-3" sx={{ marginBottom: 3 }}>
            {t('beneficial-owner')}
          </Typography>
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
          {kycCollect?.[CollectedIdDocumentDataOption.document] && (
            <Box>
              <Checkbox
                label={allT('cdo.document')}
                {...register(CollectedIdDocumentDataOption.document, {
                  onChange: handleDocumentChange,
                })}
              />
              <AnimatedContainer
                isExpanded={
                  !!kycCollect?.[
                    CollectedIdDocumentDataOption.documentAndSelfie
                  ] && !!idDocAccess
                }
              >
                <Checkbox
                  label={allT('id-doc-type.selfie')}
                  {...register(CollectedIdDocumentDataOption.documentAndSelfie)}
                />
              </AnimatedContainer>
            </Box>
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

export default KybAccess;
