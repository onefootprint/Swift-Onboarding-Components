import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedDataOption,
  CollectedKycDataOption,
  IdDocRegionality,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Checkbox, Radio, Typography } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import getFormIdForState from '../../utils/get-form-id-for-state';
import { getRequiredKycCollectFields } from '../../utils/get-onboarding-config-from-context';
import CollectedDataSummary from '../collected-data-summary';
import IdDocForm from '../id-doc-form';
import { useOnboardingConfigMachine } from '../machine-provider';

type FormData = {
  ssnKind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
  [CollectedKycDataOption.nationality]: boolean;
  idDocType: SupportedIdDocTypes[];
  regionality: IdDocRegionality;
  selfieRequired: boolean;
};

type KycCollectFormProps = {
  title?: string | React.ReactNode;
};

const KycCollectForm = ({ title }: KycCollectFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create.kyc-collect-form',
  );
  const [state, send] = useOnboardingConfigMachine();
  const { kycCollect } = state.context;
  const methods = useForm<FormData>({
    defaultValues: {
      ssnKind: kycCollect ? kycCollect.ssnKind : CollectedKycDataOption.ssn9,
      [CollectedKycDataOption.nationality]:
        kycCollect?.[CollectedKycDataOption.nationality],
      idDocType: kycCollect?.idDoc?.types || [],
      regionality: kycCollect
        ? kycCollect?.idDoc.regionality
        : IdDocRegionality.international,
      selfieRequired: kycCollect?.idDoc.selfieRequired || false,
    },
  });
  const { register, handleSubmit, watch } = methods;
  const collectedData: (CollectedDataOption | string)[] =
    getRequiredKycCollectFields();
  const ssnKind = watch('ssnKind');
  collectedData.push(
    ssnKind === CollectedKycDataOption.ssn4
      ? CollectedKycDataOption.ssn4
      : CollectedKycDataOption.ssn9,
  );
  const nationality = watch(CollectedKycDataOption.nationality);
  if (nationality) {
    collectedData.push(CollectedKycDataOption.nationality);
  }
  const idDoc = watch('idDocType');
  const selfie = watch('selfieRequired');

  if (idDoc?.length) {
    idDoc.forEach(doc => {
      collectedData.push(doc);
    });
    if (selfie) {
      collectedData.push('selfie');
    }
  }

  const handleBeforeSubmit = (formData: FormData) => {
    send({
      type: 'kycCollectSubmitted',
      payload: {
        ssnKind: formData.ssnKind,
        [CollectedKycDataOption.nationality]:
          formData[CollectedKycDataOption.nationality],
        idDoc: {
          regionality: formData.regionality,
          types: formData.idDocType,
          selfieRequired: formData.selfieRequired,
        },
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <Form
        data-testid={getFormIdForState(state.value)}
        id={getFormIdForState(state.value)}
        onSubmit={handleSubmit(handleBeforeSubmit)}
      >
        <CollectedDataSummary collectedData={collectedData} />
        {title}
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
          <Typography variant="label-3">{allT('cdo.nationality')}</Typography>
          <Checkbox
            value={CollectedKycDataOption.nationality}
            label={t('nationality')}
            {...register(CollectedKycDataOption.nationality)}
          />
        </Section>
        <IdDocForm
          title={t('id-doc.title')}
          description={t('id-doc.description')}
        />
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

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default KycCollectForm;
