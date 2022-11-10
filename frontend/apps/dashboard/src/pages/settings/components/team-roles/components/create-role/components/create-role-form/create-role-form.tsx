import { useTranslation } from '@onefootprint/hooks';
import { OrgRolePermission } from '@onefootprint/types';
import {
  createFontStyles,
  SXStyleProps,
  TextInput,
  Toggle,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';

export type CreateRoleFormData = {
  name: string;
  [OrgRolePermission.admin]: boolean;
  [OrgRolePermission.onboardingConfiguration]: boolean;
  [OrgRolePermission.apiKeys]: boolean;
  [OrgRolePermission.orgSettings]: boolean;
  [OrgRolePermission.securityLogs]: boolean;
  [OrgRolePermission.users]: boolean;
  [OrgRolePermission.decryptCustom]: boolean;
  [OrgRolePermission.decrypt]: boolean; // TODO: https://linear.app/footprint/issue/FP-1717/enable-user-to-select-specific-attributes-to-decrypt-while-creating-a
};

const DefaultFormValues: CreateRoleFormData = {
  name: '',
  [OrgRolePermission.admin]: false,
  [OrgRolePermission.onboardingConfiguration]: false,
  [OrgRolePermission.apiKeys]: false,
  [OrgRolePermission.orgSettings]: false,
  [OrgRolePermission.securityLogs]: false,
  [OrgRolePermission.users]: false,
  [OrgRolePermission.decryptCustom]: false,
  [OrgRolePermission.decrypt]: false,
};

type CreateRoleFormProps = {
  onSubmit: (formData: CreateRoleFormData) => void;
};

const CreateRoleForm = ({ onSubmit }: CreateRoleFormProps) => {
  const { t } = useTranslation('pages.settings.team-roles.create-role');
  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm<CreateRoleFormData>({ defaultValues: { ...DefaultFormValues } });

  const handleReset = () => {
    reset({ ...DefaultFormValues });
  };

  const toggleStyle: SXStyleProps = {
    justifyContent: 'space-between',
    marginBottom: 5,
  };

  return (
    <StyledForm
      id="create-role"
      name="create-role"
      onReset={handleReset}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Typography variant="caption-1" sx={{ marginBottom: 3 }}>
        {t('form.name.label')}
      </Typography>
      <TextInput
        hasError={!!errors.name}
        hint={errors?.name?.message}
        placeholder={t('form.name.placeholder')}
        type="text"
        {...register('name', {
          required: {
            value: true,
            message: t('form.name.errors.required'),
          },
        })}
      />
      <Typography variant="label-2" sx={{ marginTop: 9, marginBottom: 5 }}>
        {t('form.permissions.label')}
      </Typography>
      <Controller
        control={control}
        name={OrgRolePermission.admin}
        render={({ field }) => (
          <Toggle
            label={t('form.permissions.admin')}
            checked={field.value}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            sx={toggleStyle}
          />
        )}
      />
      <Controller
        control={control}
        name={OrgRolePermission.onboardingConfiguration}
        render={({ field }) => (
          <Toggle
            label={t('form.permissions.onboarding-configuration')}
            checked={field.value}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            sx={toggleStyle}
          />
        )}
      />
      <Controller
        control={control}
        name={OrgRolePermission.apiKeys}
        render={({ field }) => (
          <Toggle
            label={t('form.permissions.api-keys')}
            checked={field.value}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            sx={toggleStyle}
          />
        )}
      />
      <Controller
        control={control}
        name={OrgRolePermission.orgSettings}
        render={({ field }) => (
          <Toggle
            label={t('form.permissions.org-settings')}
            checked={field.value}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            sx={toggleStyle}
          />
        )}
      />
      <Controller
        control={control}
        name={OrgRolePermission.securityLogs}
        render={({ field }) => (
          <Toggle
            label={t('form.permissions.security-logs')}
            checked={field.value}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            sx={toggleStyle}
          />
        )}
      />
      <Controller
        control={control}
        name={OrgRolePermission.users}
        render={({ field }) => (
          <Toggle
            label={t('form.permissions.users')}
            checked={field.value}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            sx={toggleStyle}
          />
        )}
      />
      <Controller
        control={control}
        name={OrgRolePermission.decryptCustom}
        render={({ field }) => (
          <Toggle
            label={t('form.permissions.decrypt-custom')}
            checked={field.value}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            sx={toggleStyle}
          />
        )}
      />
      {/* TODO: https://linear.app/footprint/issue/FP-1717/enable-user-to-select-specific-attributes-to-decrypt-while-creating-a */}
      <Controller
        control={control}
        name={OrgRolePermission.decrypt}
        render={({ field }) => (
          <Toggle
            label={t('form.permissions.decrypt')}
            checked={field.value}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            sx={toggleStyle}
          />
        )}
      />
    </StyledForm>
  );
};

const StyledForm = styled.form`
  label {
    ${createFontStyles('body-3')};
  }
`;

export default CreateRoleForm;
