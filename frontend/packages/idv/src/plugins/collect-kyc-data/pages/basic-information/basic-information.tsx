import { IdDI } from '@onefootprint/types';
import { Grid, Stack } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import type { SyncDataFieldErrors } from '../../hooks/use-sync-data';
import useSyncData, {
  checkPhoneEmailBeforeSubmit,
} from '../../hooks/use-sync-data';
import type { VerifiedMethods } from '../../types';
import type { KycData } from '../../utils/data-types';
import DobField from './components/dob-field';
import EmailField from './components/email-field';
import NameFields from './components/name-fields';
import NationalityField from './components/nationality-field';
import PhoneField from './components/phone-field';
import getFieldStats from './get-field-stats';
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

const keyPrefix: 'kyc.pages.basic-information' = 'kyc.pages.basic-information';
const fieldByDi: Partial<Record<IdDI, keyof FormData>> = {
  [IdDI.firstName]: 'firstName',
  [IdDI.middleName]: 'middleName',
  [IdDI.lastName]: 'lastName',
  [IdDI.dob]: 'dob',
};

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
  const { data, initialData } = state.context;
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('idv', { keyPrefix });
  const convertFormData = useConvertFormData();
  const { dob, email, fullName, nationality, phone } = getFieldStats(
    state.context,
  );

  const formMethods = useForm<FormData>({
    defaultValues: {
      firstName: data[IdDI.firstName]?.value,
      middleName: data[IdDI.middleName]?.value,
      lastName: data[IdDI.lastName]?.value,
      dob: dob.value,
      nationality: nationality.value,
      email: email.value,
      phoneNumber: phone.value,
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
      data: checkPhoneEmailBeforeSubmit(
        initialData,
        convertFormData(formData),
        verifiedMethods,
      ),
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
        <Grid.Container
          gap={7}
          as="form"
          onSubmit={formMethods.handleSubmit(onSubmitFormData)}
        >
          <Stack direction="column" gap={5}>
            {fullName.required ? (
              <NameFields disabled={fullName.disabled} />
            ) : null}
            {dob.required ? <DobField disabled={dob.disabled} /> : null}
            {nationality.required ? (
              <NationalityField disabled={nationality.disabled} />
            ) : null}
            {phoneConfig?.visible && phone.required ? (
              <PhoneField disabled={phoneConfig?.disabled || phone.disabled} />
            ) : null}
            {emailConfig?.visible && email.required ? (
              <EmailField disabled={emailConfig?.disabled || email.disabled} />
            ) : null}
          </Stack>
          <EditableFormButtonContainer
            isLoading={mutation.isLoading}
            onCancel={onCancel}
            ctaLabel={ctaLabel}
          />
        </Grid.Container>
      </FormProvider>
    </Stack>
  );
};

export default BasicInformation;
