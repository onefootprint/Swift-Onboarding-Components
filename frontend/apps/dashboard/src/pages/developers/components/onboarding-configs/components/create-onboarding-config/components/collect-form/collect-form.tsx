import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from 'hooks';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';
import { CollectedDataOption, UserDataAttribute } from 'types';
import { Box, Checkbox, RadioInput } from 'ui';

import type { DataKindForm } from '../../create-onboarding-config.types';
import FormTitle from '../form-title';

type FormData = DataKindForm & {
  addressKind?:
    | CollectedDataOption.fullAddress
    | CollectedDataOption.partialAddress;
  showAddressOptions: boolean;
  showSSNOptions: boolean;
  ssnKind?: UserDataAttribute.ssn4 | UserDataAttribute.ssn9;
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
    ssn: defaultValues.ssn4 || defaultValues.ssn9,
    address: defaultValues.full_address || defaultValues.partial_address,
  });

  const getInitialAddressKind = () => {
    if (defaultValues.full_address) {
      return CollectedDataOption.fullAddress;
    }
    if (defaultValues.partial_address) {
      return CollectedDataOption.partialAddress;
    }
    return undefined;
  };

  const getInitialSSNKind = () => {
    if (defaultValues.ssn9) {
      return UserDataAttribute.ssn9;
    }
    if (defaultValues.ssn4) {
      return UserDataAttribute.ssn4;
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
    setValue('ssnKind', checked ? UserDataAttribute.ssn9 : undefined);
  };

  const handleAddressChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setInnerFields(prevState => ({ ...prevState, address: checked }));
    setValue(
      'addressKind',
      checked ? CollectedDataOption.fullAddress : undefined,
    );
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
      [UserDataAttribute.ssn4]: ssnKind === UserDataAttribute.ssn4,
      [UserDataAttribute.ssn9]: ssnKind === UserDataAttribute.ssn9,
      [CollectedDataOption.fullAddress]:
        addressKind === CollectedDataOption.fullAddress,
      [CollectedDataOption.partialAddress]:
        addressKind === CollectedDataOption.partialAddress,
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
      <CheckboxContainer>
        <Checkbox
          label={allT('collected-data-options.phone_number')}
          disabled
          checked
        />
        <Checkbox
          label={allT('collected-data-options.email')}
          disabled
          checked
        />
        <Checkbox
          label={allT('collected-data-options.name')}
          {...register('name')}
        />
        <Checkbox
          label={allT('collected-data-options.dob')}
          {...register(UserDataAttribute.dob)}
        />
        <Box>
          <Checkbox
            label={t('collect-form.ssn')}
            {...register('showSSNOptions')}
            onChange={handleSSNKindsChange}
          />
          <Box ref={animateSSN}>
            {innerFields.ssn && (
              <Box sx={{ marginLeft: 5, marginBottom: 3 }}>
                <RadioInput
                  value={UserDataAttribute.ssn9}
                  label={t('collect-form.ssn_full')}
                  {...register('ssnKind')}
                />
                <RadioInput
                  value={UserDataAttribute.ssn4}
                  label={t('collect-form.ssn_last_4')}
                  {...register('ssnKind')}
                />
              </Box>
            )}
          </Box>
        </Box>
        <Box>
          <Checkbox
            label={t('collect-form.address')}
            {...register('showAddressOptions')}
            onChange={handleAddressChanged}
          />
          <Box ref={animateAddress}>
            {innerFields.address && (
              <Box sx={{ marginLeft: 5, marginBottom: 3 }}>
                <RadioInput
                  value={CollectedDataOption.fullAddress}
                  label={t('collect-form.full_address')}
                  {...register('addressKind')}
                />
                <RadioInput
                  value={CollectedDataOption.partialAddress}
                  label={t('collect-form.partial_address')}
                  {...register('addressKind')}
                />
              </Box>
            )}
          </Box>
        </Box>
      </CheckboxContainer>
    </form>
  );
};

const CheckboxContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]}px;
  `}
`;

export default CollectForm;
