import type { CreateRoleRequest, RoleKind, RoleScope, UpdateRoleRequest } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { Box, TextInput } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { DecryptOptionToRoleScope } from '../../../hooks/use-decrypt-options';
import { scopeFromVaultProxyOption } from '../../../hooks/use-vault-proxy-options';
import Permissions from './components/permissions';
import type { FormData } from './form.types';

export type FormProps = {
  defaultValues?: FormData;
  onSubmit: (payload: CreateRoleRequest | UpdateRoleRequest) => void;
  kind: RoleKind;
};

const Form = ({
  onSubmit,
  defaultValues = {
    name: '',
    scopeKinds: [],
    showDecrypt: false,
    decryptOptions: [],
    vaultProxyConfigs: [],
    showProxyConfigs: false,
  },
  kind,
}: FormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.roles.form',
  });
  const formMethods = useForm<FormData>({ defaultValues });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  const handleAfterSubmit = (formData: FormData) => {
    const { name, scopeKinds, decryptOptions, vaultProxyConfigs } = formData;
    const decryptScopes = decryptOptions.map(({ value }) => DecryptOptionToRoleScope[value]);
    const vaultProxyScopes: RoleScope[] = vaultProxyConfigs.map(({ value }) => scopeFromVaultProxyOption(value));
    if (!scopeKinds.includes(RoleScopeKind.read)) {
      scopeKinds.push(RoleScopeKind.read);
    }
    const scopes = scopeKinds.map(s => ({ kind: s }));
    const allScopes: RoleScope[] = [...scopes, ...decryptScopes, ...vaultProxyScopes];
    onSubmit({
      name,
      scopes: allScopes,
      kind,
    });
  };

  return (
    <FormProvider {...formMethods}>
      <form id="roles-form" onSubmit={handleSubmit(handleAfterSubmit)}>
        <Box marginBottom={8}>
          <TextInput
            autoFocus
            hasError={!!errors.name}
            hint={errors.name?.message}
            label={t('name.label')}
            placeholder={t('name.placeholder')}
            {...register('name', {
              required: {
                value: true,
                message: t('name.errors.required'),
              },
            })}
          />
        </Box>
        <Permissions kind={kind} />
      </form>
    </FormProvider>
  );
};

export default Form;
