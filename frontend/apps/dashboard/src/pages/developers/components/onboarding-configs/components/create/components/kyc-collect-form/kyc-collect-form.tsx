import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedKycDataOption,
  IdDocRegionality,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import {
  Box,
  Checkbox,
  Divider,
  Radio,
  Toggle,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import getFormIdForState from '../../utils/get-form-id-for-state';
import CollectedDataSummary from '../collected-data-summary';
import IdDocForm from '../id-doc-form';
import { useOnboardingConfigMachine } from '../machine-provider';
import getSummary from './utils/get-summary';

type FormData = {
  requireSSN: boolean;
  optionalSSN: boolean;
  ssnKind?: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
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
  const defaultRequestSSN = kycCollect?.requireSSN ?? true;
  const defaultOptionalSSN = kycCollect?.optionalSSN ?? false;
  const defaultSSNKind = kycCollect?.ssnKind ?? CollectedKycDataOption.ssn9;
  const defaultNationality = kycCollect?.[CollectedKycDataOption.nationality];
  const defaultIdDocType = kycCollect?.idDoc?.types ?? [];
  const defaultRegionality = kycCollect?.idDoc?.regionality;
  const defaultSelfieRequired = kycCollect?.idDoc?.selfieRequired ?? false;
  const methods = useForm<FormData>({
    defaultValues: {
      requireSSN: defaultRequestSSN,
      optionalSSN: defaultOptionalSSN,
      ssnKind: defaultSSNKind,
      [CollectedKycDataOption.nationality]: defaultNationality,
      idDocType: defaultIdDocType,
      regionality: defaultRegionality,
      selfieRequired: defaultSelfieRequired,
    },
  });
  const { register, handleSubmit, watch, control, setValue } = methods;
  const collectedData = getSummary({
    requireSSN: watch('requireSSN'),
    ssnKind: watch('ssnKind'),
    nationality: watch('nationality'),
    idDocType: watch('idDocType'),
    selfieRequired: watch('selfieRequired'),
  });
  const requireSSN = watch('requireSSN');

  const handleChangerequireSSN = (checked: boolean) => {
    if (checked) {
      setValue('ssnKind', CollectedKycDataOption.ssn9);
      setValue('optionalSSN', false);
    }
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const skipSSN = !formData.requireSSN;
    send({
      type: 'kycCollectSubmitted',
      payload: {
        ssnKind: skipSSN ? undefined : formData.ssnKind,
        [CollectedKycDataOption.nationality]:
          formData[CollectedKycDataOption.nationality],
        requireSSN: formData.requireSSN,
        optionalSSN: formData.optionalSSN,
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
          <Typography variant="label-3">{t('ssn.title')}</Typography>
          <Box sx={{ display: 'flex' }}>
            <Controller
              control={control}
              name="requireSSN"
              defaultValue={defaultRequestSSN}
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  label={t('ssn.request')}
                  labelPlacement="right"
                  onChange={e => {
                    const { checked } = e.target;
                    field.onChange(checked);
                    handleChangerequireSSN(checked);
                  }}
                />
              )}
            />
          </Box>
          {requireSSN ? (
            <>
              <Divider variant="secondary" />
              <OptionsContainer>
                <Radio
                  value={CollectedKycDataOption.ssn9}
                  label={t('ssn.ssn9')}
                  {...register('ssnKind')}
                />
                <Radio
                  value={CollectedKycDataOption.ssn4}
                  label={t('ssn.ssn4')}
                  {...register('ssnKind')}
                />
              </OptionsContainer>
              <Divider variant="secondary" />
              <Checkbox
                label={t('ssn.no-ssn.label')}
                hint={t('ssn.no-ssn.hint')}
                {...register('optionalSSN')}
              />
            </>
          ) : null}
        </Section>
        <Section>
          <Typography variant="label-3">{allT('cdo.nationality')}</Typography>
          <Checkbox
            value={CollectedKycDataOption.nationality}
            label={t('nationality')}
            {...register(CollectedKycDataOption.nationality)}
          />
        </Section>
        <IdDocForm title={t('id-doc')} />
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
