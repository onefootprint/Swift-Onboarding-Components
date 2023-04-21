import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox, Divider, Radio, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import CdoTagList from 'src/components/cdo-tag-list';
import styled, { css } from 'styled-components';

import getFormIdForState from '../../utils/get-form-id-for-state';
import AnimatedContainer from '../animated-container';
import { useOnboardingConfigMachine } from '../machine-provider';
import IdDocDescription from './components/id-doc-description';
import InvestorProfileQuestions from './components/investor-profile-questions';

type FormData = {
  ssnKind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
  [CollectedDocumentDataOption.document]: boolean;
  [CollectedDocumentDataOption.documentAndSelfie]: boolean;
  [CollectedInvestorProfileDataOption.investorProfile]: boolean;
};

type KycCollectFormProps = {
  showInvestorProfile?: boolean;
};

const KycCollectForm = ({ showInvestorProfile }: KycCollectFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create.kyc-collect-form',
  );
  const [state, send] = useOnboardingConfigMachine();
  const { kycCollect } = state.context;
  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      ssnKind: kycCollect ? kycCollect.ssnKind : CollectedKycDataOption.ssn9,
      [CollectedDocumentDataOption.document]: kycCollect
        ? kycCollect[CollectedDocumentDataOption.document]
        : false,
      [CollectedDocumentDataOption.documentAndSelfie]: kycCollect
        ? kycCollect[CollectedDocumentDataOption.documentAndSelfie]
        : false,
    },
  });

  const ssnKind = watch('ssnKind');
  const idDoc = watch(CollectedDocumentDataOption.document);
  const selfie = watch(CollectedDocumentDataOption.documentAndSelfie);
  const investorProfile = watch(
    CollectedInvestorProfileDataOption.investorProfile,
  );
  const collectedData: CollectedDataOption[] = [
    CollectedKycDataOption.email,
    CollectedKycDataOption.phoneNumber,
    CollectedKycDataOption.name,
    CollectedKycDataOption.dob,
    CollectedKycDataOption.fullAddress,
  ];
  collectedData.push(
    ssnKind === CollectedKycDataOption.ssn4
      ? CollectedKycDataOption.ssn4
      : CollectedKycDataOption.ssn9,
  );
  if (idDoc && selfie) {
    collectedData.push(CollectedDocumentDataOption.documentAndSelfie);
  } else if (idDoc) {
    collectedData.push(CollectedDocumentDataOption.document);
  }
  if (investorProfile) {
    collectedData.push(CollectedInvestorProfileDataOption.investorProfile);
  }

  const handleBeforeSubmit = (formData: FormData) => {
    send({
      type: 'kycCollectSubmitted',
      payload: {
        ssnKind: formData.ssnKind,
        [CollectedDocumentDataOption.document]:
          formData[CollectedDocumentDataOption.document],
        [CollectedDocumentDataOption.documentAndSelfie]:
          formData[CollectedDocumentDataOption.documentAndSelfie],
        [CollectedInvestorProfileDataOption.investorProfile]:
          formData[CollectedInvestorProfileDataOption.investorProfile],
      },
    });
  };

  const handleIdDocChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      setValue(CollectedDocumentDataOption.documentAndSelfie, false);
    }
  };

  return (
    <Form
      data-testid={getFormIdForState(state.value)}
      id={getFormIdForState(state.value)}
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <Section>
        <Typography variant="label-3">{t('collected-data')}</Typography>
        <CdoTagList testID="collected-data" cdos={collectedData} disableSort />
      </Section>
      <Section>
        <Typography variant="label-3">{t('ssn')}</Typography>
        <OptionsContainer>
          <Radio
            value={CollectedKycDataOption.ssn9}
            label={allT('cdo.ssn9')}
            {...register('ssnKind')}
          />
          <Radio
            value={CollectedKycDataOption.ssn4}
            label={allT('cdo.ssn4')}
            {...register('ssnKind')}
          />
        </OptionsContainer>
      </Section>
      <Divider />
      <Section>
        <Typography variant="label-3">{t('add-ons.title')}</Typography>
        <OptionsContainer data-testid="kyc-collect-form-options">
          <Box>
            <Checkbox
              label={allT('cdo.document')}
              {...register(CollectedDocumentDataOption.document, {
                onChange: handleIdDocChange,
              })}
            />

            <AnimatedContainer isExpanded={idDoc}>
              <Checkbox
                label={allT('cdo.selfie')}
                {...register(CollectedDocumentDataOption.documentAndSelfie)}
              />
            </AnimatedContainer>
          </Box>
          {!idDoc && (
            <DescriptionContainer>
              <IdDocDescription />
            </DescriptionContainer>
          )}
          {showInvestorProfile && (
            <>
              <Checkbox
                label={t('add-ons.investor-profile.label')}
                {...register(
                  CollectedInvestorProfileDataOption.investorProfile,
                )}
              />
              <DescriptionContainer>
                <Typography variant="body-3" color="tertiary">
                  {t('add-ons.investor-profile.description')}
                </Typography>
                {investorProfile && <InvestorProfileQuestions />}
              </DescriptionContainer>
            </>
          )}
        </OptionsContainer>
      </Section>
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

const Section = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const DescriptionContainer = styled.div`
  ${({ theme }) => css`
    margin-left: calc(${theme.spacing[2]} + ${theme.spacing[7]});
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default KycCollectForm;
