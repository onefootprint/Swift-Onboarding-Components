import { CollectedKycDataOption, IdDI, isCountryCode } from '@onefootprint/types';
import { Grid, Stack } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import type { SyncDataFieldErrors } from '../../hooks/use-sync-data';
import useSyncData, { checkPhoneEmailBeforeSubmit } from '../../hooks/use-sync-data';
import type { VerifiedMethods } from '../../types';
import allAttributes from '../../utils/all-attributes';
import type { KycData } from '../../utils/data-types';
import getInitialCountry from '../../utils/get-initial-country';
import DobField from './components/dob-field';
import EmailField from './components/email-field';
import NameFields from './components/name-fields';
import NationalityField from './components/nationality-field';
import PhoneField from './components/phone-field';
import useConvertFormData from './hooks/use-convert-form-data';
import type { FormData } from './types';

type BasicInformationProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: (args: KycData) => void;
  onCancel?: () => void;
  emailConfig?: { visible: boolean; disabled: boolean };
  phoneConfig?: { visible: boolean; disabled: boolean };
  verifiedMethods?: VerifiedMethods;
};

const keyPrefix = 'kyc.pages.basic-information' as const;
const fieldByDi: Partial<Record<IdDI, keyof FormData>> = {
  [IdDI.firstName]: 'firstName',
  [IdDI.middleName]: 'middleName',
  [IdDI.lastName]: 'lastName',
  [IdDI.dob]: 'dob',
};

const isTest = process.env.NODE_ENV === 'test';

const BasicInformation = ({
  ctaLabel,
  hideHeader,
  onCancel,
  onComplete,
  emailConfig,
  phoneConfig,
  verifiedMethods,
}: BasicInformationProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { data, initialData, requirement } = state.context;
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('idv', { keyPrefix });
  const convertFormData = useConvertFormData();
  const attributes = allAttributes(requirement);
  const requiresName = attributes.includes(CollectedKycDataOption.name);
  const requiresDob = attributes.includes(CollectedKycDataOption.dob);
  const requiresNationality = attributes.includes(CollectedKycDataOption.nationality);
  const requiresPhone = !isTest && attributes.includes(CollectedKycDataOption.phoneNumber);
  const requiresEmail = !isTest && attributes.includes(CollectedKycDataOption.email);

  const isNameDisabled = data?.[IdDI.firstName]?.disabled && data?.[IdDI.lastName]?.disabled;
  const isNationalityDisabled = data?.[IdDI.nationality]?.disabled;
  const isDobDisabled = data?.[IdDI.dob]?.disabled;
  const isPhoneDisabled = data?.[IdDI.phoneNumber]?.disabled;
  const isEmailDisabled = data?.[IdDI.email]?.disabled;

  const nationalityValue = data?.[IdDI.nationality]?.value;
  const defaultNationality = nationalityValue && isCountryCode(nationalityValue) ? nationalityValue : undefined;
  const formMethods = useForm<FormData>({
    defaultValues: {
      firstName: data[IdDI.firstName]?.value,
      middleName: data[IdDI.middleName]?.value,
      lastName: data[IdDI.lastName]?.value,
      dob: data?.[IdDI.dob]?.value,
      nationality: getInitialCountry(defaultNationality),
      email: data?.[IdDI.email]?.value,
      phoneNumber: data?.[IdDI.phoneNumber]?.value,
    },
  });

  const { setError } = formMethods;
  const handleSyncDataError = (error: SyncDataFieldErrors) => {
    Object.entries(error).forEach(([k, message]) => {
      const di = k as IdDI;
      const field = fieldByDi[di];
      if (field) {
        setError(field, { message }, { shouldFocus: true });
      }
    });
  };

  const onSubmitFormData = (formData: FormData) => {
    syncData({
      data: checkPhoneEmailBeforeSubmit(initialData, convertFormData(formData), requirement, verifiedMethods),
      onError: handleSyncDataError,
      onSuccess: cleanData => {
        send({ type: 'dataSubmitted', payload: cleanData });
        onComplete?.(cleanData);
      },
    });
  };

  return (
    <Stack direction="column" gap={7} width="100%">
      {hideHeader ? null : (
        <>
          <NavigationHeader />
          <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        </>
      )}
      <FormProvider {...formMethods}>
        <Grid.Container gap={7} tag="form" onSubmit={formMethods.handleSubmit(onSubmitFormData)}>
          <Stack direction="column" gap={5}>
            {requiresName ? <NameFields disabled={isNameDisabled} /> : null}
            {requiresDob ? <DobField disabled={isDobDisabled} /> : null}
            {requiresNationality ? <NationalityField disabled={isNationalityDisabled} /> : null}
            {phoneConfig?.visible && requiresPhone ? (
              <PhoneField disabled={phoneConfig?.disabled || isPhoneDisabled} />
            ) : null}
            {emailConfig?.visible && requiresEmail ? (
              <EmailField disabled={emailConfig?.disabled || isEmailDisabled} />
            ) : null}
          </Stack>
          <EditableFormButtonContainer
            isLoading={mutation.isLoading}
            onCancel={onCancel}
            ctaLabel={ctaLabel}
            submitButtonTestID="kyc-basic-information"
          />
        </Grid.Container>
      </FormProvider>
    </Stack>
  );
};

export default BasicInformation;
