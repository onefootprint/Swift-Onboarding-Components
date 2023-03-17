import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Box, Checkbox, Divider, Radio, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import TagList from '../../../onboarding-configs-data/components/onboarding-config-item/components/tag-list';
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
    'pages.developers.onboarding-configs.create-dialog.kyc-collect-form',
  );
  const [state, send] = useOnboardingConfigMachine();
  const { kycCollect } = state.context;
  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      ssnKind: kycCollect ? kycCollect.ssnKind : CollectedKycDataOption.ssn4,
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
  const collectedDataTags = [
    allT('collected-data-options.email'),
    allT('collected-data-options.phone_number'),
    allT('collected-data-options.name'),
    allT('collected-data-options.dob'),
    allT('collected-data-options.full_address'),
  ];
  collectedDataTags.push(
    ssnKind === CollectedKycDataOption.ssn4
      ? allT('collected-data-options.ssn4')
      : allT('collected-data-options.ssn9'),
  );
  if (idDoc && selfie) {
    collectedDataTags.push(allT('collected-data-options.document_and_selfie'));
  } else if (idDoc) {
    collectedDataTags.push(allT('collected-data-options.document'));
  }
  if (investorProfile) {
    collectedDataTags.push(allT('collected-data-options.investor_profile'));
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
        <TagList testID="collected-data" items={collectedDataTags} />
      </Section>
      <Section>
        <Typography variant="label-3">{t('ssn')}</Typography>
        <OptionsContainer>
          <Radio
            value={CollectedKycDataOption.ssn4}
            label={allT('collected-data-options.ssn4')}
            {...register('ssnKind')}
          />
          <Radio
            value={CollectedKycDataOption.ssn9}
            label={allT('collected-data-options.ssn9')}
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
              label={allT('collected-data-options.document')}
              {...register(CollectedDocumentDataOption.document, {
                onChange: handleIdDocChange,
              })}
            />

            <AnimatedContainer isExpanded={idDoc}>
              <Checkbox
                label={allT('collected-data-options.selfie')}
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
