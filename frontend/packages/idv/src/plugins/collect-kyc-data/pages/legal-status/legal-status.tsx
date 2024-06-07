import { COUNTRIES } from '@onefootprint/global-constants';
import { IdDI, UsLegalStatus } from '@onefootprint/types';
import type { CountrySelectOption } from '@onefootprint/ui';
import { Divider, Grid } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData, { omitPhoneAndEmail } from '../../hooks/use-sync-data';
import type { KycData } from '../../utils/data-types';
import CitizenshipFields from './components/citizenship-fields';
import CountryOfBirthField from './components/country-of-birth-field';
import StatusFields from './components/status-fields';
import VisaFields from './components/visa-fields';
import useConvertFormData from './hooks/use-convert-form-data';
import type { CountrySelectOptionOrPlaceholder, FormData, VisaFormData } from './types';
import getCountrySelectOption from './utils/get-country-select-option';

type LegalStatusProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: (args: KycData) => void;
  onCancel?: () => void;
};

const LegalStatus = ({ ctaLabel, hideHeader, onComplete, onCancel }: LegalStatusProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { data } = state.context;
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.legal-status' });
  const convertFormData = useConvertFormData();

  const usCountryRecord = COUNTRIES.find(country => country.value === 'US');
  const usCountrySelectOption = {
    label: usCountryRecord?.label,
    value: usCountryRecord?.value,
  };

  const emptyFieldValues: FormData = {
    usLegalStatus: UsLegalStatus.citizen,
    nationality: usCountrySelectOption,
    citizenships: [{ label: '', value: undefined }] as CountrySelectOptionOrPlaceholder[],
  };

  const citizenshipsValue = data[IdDI.citizenships]?.value;
  let { citizenships } = emptyFieldValues;
  if (citizenshipsValue) {
    citizenships = citizenshipsValue
      .map(maybeCountryCode => getCountrySelectOption(maybeCountryCode))
      .filter((option): option is CountrySelectOption => !!option);
  }

  const visaKindValue = data?.[IdDI.visaKind]?.value;
  const visa: VisaFormData = {
    kind: visaKindValue && {
      value: visaKindValue,
      label: t(`form.visa-kind.mapping.${visaKindValue}`),
    },
    expirationDate: data?.[IdDI.visaExpirationDate]?.value,
  };

  const usLegalStatus = data[IdDI.usLegalStatus]?.value ?? emptyFieldValues.usLegalStatus;
  const nationality = getCountrySelectOption(data[IdDI.nationality]?.value) ?? emptyFieldValues.nationality;
  const methods = useForm<FormData>({
    defaultValues: {
      usLegalStatus,
      nationality,
      citizenships,
      visa,
    },
  });
  const { clearErrors, watch, setValue } = methods;
  const selectedOption = watch('usLegalStatus');

  const handleStatusChange = (newStatus: UsLegalStatus) => {
    setValue(
      'nationality',
      newStatus === UsLegalStatus.citizen ? usCountrySelectOption : { label: '', value: undefined },
    );
    setValue('citizenships', emptyFieldValues.citizenships);
    setValue('visa', emptyFieldValues.visa);
    clearErrors(['nationality', 'citizenships', 'visa']);
  };

  const handleBeforeSubmit = (formData: FormData) => {
    syncData({
      data: omitPhoneAndEmail(convertFormData(formData)),
      onSuccess: cleanData => {
        send({
          type: 'dataSubmitted',
          payload: cleanData,
        });
        onComplete?.(cleanData);
      },
    });
  };

  return (
    <>
      {hideHeader ? null : (
        <>
          <NavigationHeader />
          <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        </>
      )}
      <FormProvider {...methods}>
        <Grid.Container
          tag="form"
          onSubmit={methods.handleSubmit(handleBeforeSubmit)}
          marginTop={7}
          width="100%"
          gap={6}
        >
          <StatusFields handleStatusChange={handleStatusChange} />
          <Divider />
          <CountryOfBirthField />
          {selectedOption && selectedOption !== UsLegalStatus.citizen && <CitizenshipFields />}
          {selectedOption === UsLegalStatus.visa && <VisaFields />}
          <EditableFormButtonContainer
            isLoading={mutation.isLoading}
            onCancel={onCancel}
            ctaLabel={ctaLabel}
            submitButtonTestID="continue-button"
          />
        </Grid.Container>
      </FormProvider>
    </>
  );
};

export default LegalStatus;
