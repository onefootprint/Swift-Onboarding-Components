import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox, Divider, Radio, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import AnimatedContainer from 'src/components/animated-container';
import CdoTagList from 'src/components/cdo-tag-list';

import getFormIdForState from '../../utils/get-form-id-for-state';
import { useOnboardingConfigMachine } from '../machine-provider';
import IdDocDescription from './components/id-doc-description';
import InvestorProfileQuestions from './components/investor-profile-questions';

type FormData = {
  ssnKind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
  [CollectedKycDataOption.nationality]: boolean;
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
      [CollectedKycDataOption.nationality]:
        kycCollect?.[CollectedKycDataOption.nationality],
      [CollectedDocumentDataOption.document]:
        kycCollect?.[CollectedDocumentDataOption.document],
      [CollectedDocumentDataOption.documentAndSelfie]:
        kycCollect?.[CollectedDocumentDataOption.documentAndSelfie],
    },
  });

  const ssnKind = watch('ssnKind');
  const idDoc = watch(CollectedDocumentDataOption.document);
  const selfie = watch(CollectedDocumentDataOption.documentAndSelfie);
  const nationality = watch(CollectedKycDataOption.nationality);
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
  if (nationality) {
    collectedData.push(CollectedKycDataOption.nationality);
  }
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
        [CollectedKycDataOption.nationality]:
          formData[CollectedKycDataOption.nationality],
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
      <Section>
        <Typography variant="label-3">{t('nationality')}</Typography>
        <Checkbox
          value={CollectedKycDataOption.nationality}
          label={allT('cdo.nationality')}
          {...register(CollectedKycDataOption.nationality)}
        />
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

            <AnimatedContainer
              isExpanded={idDoc}
              sx={{ marginLeft: 5, marginTop: 3 }}
            >
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
