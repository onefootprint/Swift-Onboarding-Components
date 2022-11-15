import { useTranslation } from '@onefootprint/hooks';
import { OrgRolePermissionKind } from '@onefootprint/types';
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
  [OrgRolePermissionKind.admin]: boolean;
  [OrgRolePermissionKind.onboardingConfiguration]: boolean;
  [OrgRolePermissionKind.apiKeys]: boolean;
  [OrgRolePermissionKind.orgSettings]: boolean;
  [OrgRolePermissionKind.securityLogs]: boolean;
  [OrgRolePermissionKind.users]: boolean;
  [OrgRolePermissionKind.decryptCustom]: boolean;
  [OrgRolePermissionKind.decrypt]: boolean; // TODO: https://linear.app/footprint/issue/FP-1717/enable-user-to-select-specific-attributes-to-decrypt-while-creating-a
};

const DefaultFormValues: CreateRoleFormData = {
  name: '',
  [OrgRolePermissionKind.admin]: false,
  [OrgRolePermissionKind.onboardingConfiguration]: false,
  [OrgRolePermissionKind.apiKeys]: false,
  [OrgRolePermissionKind.orgSettings]: false,
  [OrgRolePermissionKind.securityLogs]: false,
  [OrgRolePermissionKind.users]: false,
  [OrgRolePermissionKind.decryptCustom]: false,
  [OrgRolePermissionKind.decrypt]: false,
};

type CreateRoleFormProps = {
  onSubmit: (formData: CreateRoleFormData) => void;
};

const CreateRoleForm = ({ onSubmit }: CreateRoleFormProps) => {
  const { t, allT } = useTranslation('pages.settings.team-roles.create-role');
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
        {t('form.permissions')}
      </Typography>
      <Controller
        control={control}
        name={OrgRolePermissionKind.admin}
        render={({ field }) => (
          <Toggle
            label={allT(`org-role-permissions.${OrgRolePermissionKind.admin}`)}
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
        name={OrgRolePermissionKind.onboardingConfiguration}
        render={({ field }) => (
          <Toggle
            label={allT(
              `org-role-permissions.${OrgRolePermissionKind.onboardingConfiguration}`,
            )}
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
        name={OrgRolePermissionKind.apiKeys}
        render={({ field }) => (
          <Toggle
            label={allT(
              `org-role-permissions.${OrgRolePermissionKind.apiKeys}`,
            )}
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
        name={OrgRolePermissionKind.orgSettings}
        render={({ field }) => (
          <Toggle
            label={allT(
              `org-role-permissions.${OrgRolePermissionKind.orgSettings}`,
            )}
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
        name={OrgRolePermissionKind.securityLogs}
        render={({ field }) => (
          <Toggle
            label={allT(
              `org-role-permissions.${OrgRolePermissionKind.securityLogs}`,
            )}
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
        name={OrgRolePermissionKind.users}
        render={({ field }) => (
          <Toggle
            label={allT(`org-role-permissions.${OrgRolePermissionKind.users}`)}
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
        name={OrgRolePermissionKind.decryptCustom}
        render={({ field }) => (
          <Toggle
            label={allT(
              `org-role-permissions.${OrgRolePermissionKind.decryptCustom}`,
            )}
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
        name={OrgRolePermissionKind.decrypt}
        render={({ field }) => (
          <Toggle
            label={allT(
              `org-role-permissions.${OrgRolePermissionKind.decrypt}`,
            )}
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
