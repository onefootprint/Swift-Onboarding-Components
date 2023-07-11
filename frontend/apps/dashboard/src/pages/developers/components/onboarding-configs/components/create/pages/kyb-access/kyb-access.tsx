import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox, Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import AnimatedContainer from 'src/components/animated-container';

import FormTitle from '../../components/form-title';
import { useOnboardingConfigMachine } from '../../components/machine-provider';
import getDefaultKycAccess from '../../utils/get-default-kyc-access';
import getFormIdForState from '../../utils/get-form-id-for-state';

type FormData = {
  allKybData: boolean;
} & Record<
  | CollectedKycDataOption
  | CollectedDocumentDataOption
  | CollectedInvestorProfileDataOption,
  boolean
>;

const KybAccess = () => {
  const [state, send] = useOnboardingConfigMachine();
  const { kycCollect, kybAccess } = state.context;
  const hasCollectedDoc = !!kycCollect && kycCollect?.idDoc.types.length > 0;
  const hasCollectedSelfie =
    hasCollectedDoc && !!kycCollect && kycCollect?.idDoc.selfieRequired;
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create.kyb-access-form',
  );

  const handleBeforeSubmit = (formData: FormData) => {
    // Remove the allKybData field
    const kycAccessFormData = (({ allKybData, ...o }) => o)(formData);
    send({
      type: 'kybAccessSubmitted',
      payload: {
        kybAccess: {
          allKybData: formData.allKybData,
        },
        kycAccess: kycAccessFormData,
      },
    });
  };

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      allKybData: kybAccess ? kybAccess.allKybData : true,
      ...getDefaultKycAccess(state.context),
    },
  });

  const idDocAccess = watch(CollectedDocumentDataOption.document);
  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      setValue(CollectedDocumentDataOption.documentAndSelfie, false);
    }
  };

  return (
    <Form
      id={getFormIdForState(state.value)}
      data-testid={getFormIdForState(state.value)}
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <FormTitle title={t('title')} description={t('description')} />
      <OptionsContainer>
        <Checkbox label={t('all-business-info')} {...register('allKybData')} />
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
        {kycCollect?.[CollectedKycDataOption.nationality] && (
          <Checkbox
            label={allT('cdo.nationality')}
            {...register(CollectedKycDataOption.nationality)}
          />
        )}
        {hasCollectedDoc && (
          <Box>
            <Checkbox
              label={allT('cdo.document')}
              {...register(CollectedDocumentDataOption.document, {
                onChange: handleDocumentChange,
              })}
            />
            <AnimatedContainer
              isExpanded={
                hasCollectedDoc && hasCollectedSelfie && !!idDocAccess
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
      </OptionsContainer>
    </Form>
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
