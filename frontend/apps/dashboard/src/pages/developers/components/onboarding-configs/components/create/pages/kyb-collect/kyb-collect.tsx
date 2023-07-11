import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CollectedKybDataOption } from '@onefootprint/types';
import { Checkbox, InlineAlert, Typography } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import useSession from 'src/hooks/use-session';

import CollectedDataSummary from '../../components/collected-data-summary';
import FormTitle from '../../components/form-title';
import { useOnboardingConfigMachine } from '../../components/machine-provider';
import getFormIdForState from '../../utils/get-form-id-for-state';
import { getRequiredKybCollectFields } from '../../utils/get-onboarding-config-from-context';

type FormData = {
  [CollectedKybDataOption.kycedBeneficialOwners]: boolean;
  [CollectedKybDataOption.website]: boolean;
  [CollectedKybDataOption.phoneNumber]: boolean;
};

const KybCollect = () => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create.kyb-collect-form',
  );
  const [state, send] = useOnboardingConfigMachine();
  const {
    data: { user },
  } = useSession();
  const { kybCollect } = state.context;
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      [CollectedKybDataOption.kycedBeneficialOwners]: kybCollect
        ? kybCollect[CollectedKybDataOption.kycedBeneficialOwners]
        : false,
      [CollectedKybDataOption.website]: kybCollect
        ? kybCollect[CollectedKybDataOption.website]
        : false,
      [CollectedKybDataOption.phoneNumber]: kybCollect
        ? kybCollect[CollectedKybDataOption.phoneNumber]
        : false,
    },
  });

  const handleBeforeSubmit = (formData: FormData) => {
    send({
      type: 'kybCollectSubmitted',
      payload: {
        ...formData,
      },
    });
  };

  const kycedBeneficialOwners = watch(
    CollectedKybDataOption.kycedBeneficialOwners,
  );
  const website = watch(CollectedKybDataOption.website);
  const phoneNumber = watch(CollectedKybDataOption.phoneNumber);
  const collectedData: CollectedKybDataOption[] = getRequiredKybCollectFields();
  // Always collect BOs, but optionally allow fully KYCing the BOs
  if (kycedBeneficialOwners) {
    const index = collectedData.indexOf(
      CollectedKybDataOption.beneficialOwners,
    );
    if (index > -1) {
      collectedData.splice(index, 1);
    }
    collectedData.push(CollectedKybDataOption.kycedBeneficialOwners);
  }
  if (website) {
    collectedData.push(CollectedKybDataOption.website);
  }
  if (phoneNumber) {
    collectedData.push(CollectedKybDataOption.phoneNumber);
  }

  return (
    <Form
      data-testid={getFormIdForState(state.value)}
      id={getFormIdForState(state.value)}
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <CollectedDataSummary collectedData={collectedData} />
      <FormTitle title={t('title')} description={t('description')} />
      <Section>
        <Typography variant="label-3" color="tertiary">
          {t('optional')}
        </Typography>
        <OptionsContainer data-testid="kyb-collect-form-options">
          {/* Long term, all KYB configs will KYC all BOs. For now, just a flag for employees */}
          {user?.isFirmEmployee && (
            <Checkbox
              label={t('kyced-beneficial-owners')}
              {...register(CollectedKybDataOption.kycedBeneficialOwners)}
            />
          )}
          <Checkbox
            label={allT('cdo.business_website')}
            {...register(CollectedKybDataOption.website)}
          />
          <Checkbox
            label={allT('cdo.business_phone_number')}
            {...register(CollectedKybDataOption.phoneNumber)}
          />
        </OptionsContainer>
      </Section>
      <InlineAlert variant="info" sx={{ alignItems: 'center' }}>
        <Typography variant="body-3" color="info">
          {t('beneficial-owner-warning')}
        </Typography>
      </InlineAlert>
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

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[2]};
  `}
`;

export default KybCollect;
