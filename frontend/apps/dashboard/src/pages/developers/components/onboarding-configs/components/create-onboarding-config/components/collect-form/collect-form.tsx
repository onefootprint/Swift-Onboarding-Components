import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from 'hooks';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DataKinds, VirtualDataKinds } from 'src/types/data-kind';
import { Box, Checkbox, RadioInput } from 'ui';

import type { DataKindForm } from '../../create-onboarding-config.types';
import FormTitle from '../form-title';

type FormData = DataKindForm & {
  addressKind?: VirtualDataKinds.addressFull | VirtualDataKinds.addressPartial;
  showAddressOptions: boolean;
  showSSNOptions: boolean;
  ssnKind?: DataKinds.lastFourSsn | DataKinds.ssn;
};

type CollectFormProps = {
  defaultValues: DataKindForm;
  onSubmit: (formData: DataKindForm) => void;
};

const CollectForm = ({ defaultValues, onSubmit }: CollectFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );
  const [animateSSN] = useAutoAnimate<HTMLDivElement>();
  const [animateAddress] = useAutoAnimate<HTMLDivElement>();
  const [innerFields, setInnerFields] = useState({
    ssn: defaultValues.last_four_ssn || defaultValues.ssn,
    address: defaultValues.address_full || defaultValues.address_partial,
  });

  const getInitialAddressKind = () => {
    if (defaultValues.address_full) {
      return VirtualDataKinds.addressFull;
    }
    if (defaultValues.address_partial) {
      return VirtualDataKinds.addressPartial;
    }
    return undefined;
  };

  const getInitialSSNKind = () => {
    if (defaultValues.ssn) {
      return DataKinds.ssn;
    }
    if (defaultValues.last_four_ssn) {
      return DataKinds.lastFourSsn;
    }
    return undefined;
  };

  const { setValue, register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      addressKind: getInitialAddressKind(),
      showAddressOptions: innerFields.address,
      showSSNOptions: innerFields.ssn,
      ssnKind: getInitialSSNKind(),
    },
  });

  const handleSSNKindsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setInnerFields(prevState => ({ ...prevState, ssn: checked }));
    setValue('ssnKind', checked ? DataKinds.ssn : undefined);
  };

  const handleAddressChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setInnerFields(prevState => ({ ...prevState, address: checked }));
    setValue('addressKind', checked ? VirtualDataKinds.addressFull : undefined);
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const {
      showSSNOptions,
      showAddressOptions,
      ssnKind,
      addressKind,
      ...rest
    } = formData;
    onSubmit({
      ...rest,
      [DataKinds.lastFourSsn]: ssnKind === DataKinds.lastFourSsn,
      [DataKinds.ssn]: ssnKind === DataKinds.ssn,
      [VirtualDataKinds.addressFull]:
        addressKind === VirtualDataKinds.addressFull,
      [VirtualDataKinds.addressPartial]:
        addressKind === VirtualDataKinds.addressPartial,
    });
  };

  return (
    <form
      data-testid="collect-form"
      id="collect-form"
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <FormTitle
        description={t('collect-form.description')}
        title={t('collect-form.title')}
      />
      <Checkbox label={allT('data-kinds.phone_number')} disabled checked />
      <Checkbox label={allT('data-kinds.email')} disabled checked />
      <Checkbox label={allT('data-kinds.name')} {...register('name')} />
      <Checkbox label={allT('data-kinds.dob')} {...register(DataKinds.dob)} />
      <Checkbox
        label={t('collect-form.ssn')}
        {...register('showSSNOptions')}
        onChange={handleSSNKindsChange}
      />
      <Box ref={animateSSN}>
        {innerFields.ssn && (
          <Box sx={{ marginLeft: 5, marginBottom: 3 }}>
            <RadioInput
              value={DataKinds.ssn}
              label={t('collect-form.ssn_full')}
              {...register('ssnKind')}
            />
            <RadioInput
              value={DataKinds.lastFourSsn}
              label={t('collect-form.ssn_last_4')}
              {...register('ssnKind')}
            />
          </Box>
        )}
      </Box>
      <Checkbox
        label={t('collect-form.address')}
        {...register('showAddressOptions')}
        onChange={handleAddressChanged}
      />
      <Box ref={animateAddress}>
        {innerFields.address && (
          <Box sx={{ marginLeft: 5, marginBottom: 3 }}>
            <RadioInput
              value={VirtualDataKinds.addressFull}
              label={t('collect-form.address_full')}
              {...register('addressKind')}
            />
            <RadioInput
              value={VirtualDataKinds.addressPartial}
              label={t('collect-form.address_partial')}
              {...register('addressKind')}
            />
          </Box>
        )}
      </Box>
    </form>
  );
};

export default CollectForm;
