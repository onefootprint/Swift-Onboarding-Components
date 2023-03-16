import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedDocumentDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import getFormIdForState from '../../utils/get-form-id-for-state/get-form-id-for-state';
import AnimatedContainer from '../animated-container';
import FormTitle from '../form-title';
import { useOnboardingConfigMachine } from '../machine-provider';

type FormData = Record<
  CollectedKycDataOption | CollectedDocumentDataOption,
  boolean
>;

const KycAccessForm = () => {
  const [state, send] = useOnboardingConfigMachine();
  const { kycCollect } = state.context;
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create-dialog.kyc-access-form',
  );

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
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
            label={allT('collected-data-options.email')}
            {...register(CollectedKycDataOption.email)}
          />
          <Checkbox
            label={allT('collected-data-options.phone_number')}
            {...register(CollectedKycDataOption.phoneNumber)}
          />
          <Checkbox
            label={allT('collected-data-options.name')}
            {...register(CollectedKycDataOption.name)}
          />
          <Checkbox
            label={allT('collected-data-options.dob')}
            {...register(CollectedKycDataOption.dob)}
          />
          <Checkbox
            label={allT('collected-data-options.full_address')}
            {...register(CollectedKycDataOption.fullAddress)}
          />
          {kycCollect?.ssnKind === CollectedKycDataOption.ssn4 && (
            <Checkbox
              label={allT('collected-data-options.ssn4')}
              {...register(CollectedKycDataOption.ssn4)}
            />
          )}
          {kycCollect?.ssnKind === CollectedKycDataOption.ssn9 && (
            <Checkbox
              label={allT('collected-data-options.ssn9')}
              {...register(CollectedKycDataOption.ssn9)}
            />
          )}
          <Box>
            {kycCollect?.[CollectedDocumentDataOption.document] && (
              <Checkbox
                label={allT('collected-data-options.document')}
                {...register(CollectedDocumentDataOption.document, {
                  onChange: handleDocumentChange,
                })}
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
                {...register(CollectedDocumentDataOption.documentAndSelfie)}
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

export default KycAccessForm;
