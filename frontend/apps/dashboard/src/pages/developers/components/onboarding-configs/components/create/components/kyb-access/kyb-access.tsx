import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedDocumentDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox, Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import getFormIdForState from '../../utils/get-form-id-for-state/get-form-id-for-state';
import AnimatedContainer from '../animated-container';
import FormTitle from '../form-title';
import { useOnboardingConfigMachine } from '../machine-provider';

type FormData = {
  allKybData: boolean;
  kycData: Record<
    CollectedKycDataOption | CollectedDocumentDataOption,
    boolean
  >;
};

const KybAccess = () => {
  const [state, send] = useOnboardingConfigMachine();
  const { kycCollect } = state.context;
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create-dialog.kyb-access-form',
  );

  const handleBeforeSubmit = (formData: FormData) => {
    send({
      type: 'kybAccessSubmitted',
      payload: {
        ...formData,
      },
    });
  };

  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      allKybData: true,
      kycData: {
        [CollectedKycDataOption.email]: true,
        [CollectedKycDataOption.phoneNumber]: true,
        [CollectedKycDataOption.name]: true,
        [CollectedKycDataOption.dob]: true,
        [CollectedKycDataOption.fullAddress]: true,
        [CollectedKycDataOption.ssn4]:
          kycCollect?.ssnKind === CollectedKycDataOption.ssn4,
        [CollectedKycDataOption.ssn9]:
          kycCollect?.ssnKind === CollectedKycDataOption.ssn9,
        [CollectedDocumentDataOption.document]:
          kycCollect?.[CollectedDocumentDataOption.document],
        [CollectedDocumentDataOption.documentAndSelfie]:
          kycCollect?.[CollectedDocumentDataOption.documentAndSelfie],
      },
    },
  });

  const idDocAccess = watch(`kycData.${CollectedDocumentDataOption.document}`);

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
          <Typography variant="body-3" sx={{ marginBottom: 3 }}>
            {t('beneficial-owner')}
          </Typography>
          <Checkbox
            label={allT('collected-data-options.email')}
            {...register(`kycData.${CollectedKycDataOption.email}`)}
          />
          <Checkbox
            label={allT('collected-data-options.phone_number')}
            {...register(`kycData.${CollectedKycDataOption.phoneNumber}`)}
          />
          <Checkbox
            label={allT('collected-data-options.name')}
            {...register(`kycData.${CollectedKycDataOption.name}`)}
          />
          <Checkbox
            label={allT('collected-data-options.dob')}
            {...register(`kycData.${CollectedKycDataOption.dob}`)}
          />
          <Checkbox
            label={allT('collected-data-options.full_address')}
            {...register(`kycData.${CollectedKycDataOption.fullAddress}`)}
          />
          {kycCollect?.ssnKind === CollectedKycDataOption.ssn4 && (
            <Checkbox
              label={allT('collected-data-options.ssn4')}
              {...register(`kycData.${CollectedKycDataOption.ssn4}`)}
            />
          )}
          {kycCollect?.ssnKind === CollectedKycDataOption.ssn9 && (
            <Checkbox
              label={allT('collected-data-options.ssn9')}
              {...register(`kycData.${CollectedKycDataOption.ssn9}`)}
            />
          )}
          <Box>
            {kycCollect?.[CollectedDocumentDataOption.document] && (
              <Checkbox
                label={allT('collected-data-options.document')}
                {...register(`kycData.${CollectedDocumentDataOption.document}`)}
              />
            )}
            <AnimatedContainer
              isExpanded={
                !!kycCollect?.[CollectedDocumentDataOption.documentAndSelfie] &&
                !!idDocAccess
              }
            >
              <Checkbox
                label={allT('id-doc-type.selfie')}
                {...register(
                  `kycData.${CollectedDocumentDataOption.documentAndSelfie}`,
                )}
              />
            </AnimatedContainer>
          </Box>
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
