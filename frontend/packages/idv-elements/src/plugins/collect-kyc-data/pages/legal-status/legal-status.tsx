import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDI, UsLegalStatus } from '@onefootprint/types';
import type { CountrySelectOption } from '@onefootprint/ui';
import { Divider, Grid, media } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { KycData } from '../../utils/data-types';
import CountryFields from './components/country-fields';
import StatusFields from './components/status-fields';
import VisaFields from './components/visa-fields';
import useConvertFormData from './hooks/use-convert-form-data';
import type {
  CountrySelectOptionOrPlaceholder,
  FormData,
  VisaFormData,
} from './types';
import getCountrySelectOption from './utils/get-country-select-option';

type LegalStatusProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: (args: KycData) => void;
  onCancel?: () => void;
};

const LegalStatus = ({
  ctaLabel,
  hideHeader,
  onComplete,
  onCancel,
}: LegalStatusProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { data } = state.context;
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('pages.legal-status');
  const convertFormData = useConvertFormData();

  const emptyFieldValues: FormData = {
    usLegalStatus: UsLegalStatus.citizen,
    nationality: { label: '', value: undefined },
    citizenships: [
      { label: '', value: undefined },
    ] as CountrySelectOptionOrPlaceholder[],
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

  const usLegalStatus =
    data[IdDI.usLegalStatus]?.value ?? emptyFieldValues.usLegalStatus;
  const nationality = getCountrySelectOption(data[IdDI.nationality]?.value);
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

  const handleStatusChange = () => {
    setValue('nationality', emptyFieldValues.nationality);
    setValue('citizenships', emptyFieldValues.citizenships);
    setValue('visa', emptyFieldValues.visa);
    clearErrors(['nationality', 'citizenships', 'visa']);
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const convertedData = convertFormData(formData);
    syncData({
      data: convertedData,
      speculative: true,
      onSuccess: () => {
        send({
          type: 'dataSubmitted',
          payload: convertedData,
        });
        onComplete?.(convertedData);
      },
    });
  };

  return (
    <>
      {hideHeader ? null : (
        <>
          <NavigationHeader />
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            sx={{ marginBottom: 7 }}
          />
        </>
      )}
      <FormProvider {...methods}>
        <Form as="form" onSubmit={methods.handleSubmit(handleBeforeSubmit)}>
          <StatusFields handleStatusChange={handleStatusChange} />
          {selectedOption && selectedOption !== UsLegalStatus.citizen && (
            <>
              <Divider />
              <CountryFields />
            </>
          )}
          {selectedOption === UsLegalStatus.visa && <VisaFields />}
          <EditableFormButtonContainer
            isLoading={mutation.isLoading}
            onCancel={onCancel}
            ctaLabel={ctaLabel}
            submitButtonTestID="continue-button"
          />
        </Form>
      </FormProvider>
    </>
  );
};

const Form = styled(Grid.Container)`
  ${({ theme }) => css`
    width: 100%;
    row-gap: ${theme.spacing[5]};

    ${media.lessThan('sm')`
      row-gap: ${theme.spacing[6]};
    `}
  `}
`;

export default LegalStatus;
