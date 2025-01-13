import { Form as FormComponent } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type {
  CreateTenantRoleRequest,
  TenantRoleKindDiscriminant,
  TenantScope,
} from '@onefootprint/request-types/dashboard';
import { DecryptOptionToTenantScope } from '../../../hooks/use-decrypt-options';
import { tenantScopeFromVaultProxyOption } from '../../../hooks/use-vault-proxy-options';
import Permissions from './components/permissions';
import type { FormData } from './form.types';

export type FormProps = {
  defaultValues?: FormData;
  onSubmit: (payload: CreateTenantRoleRequest) => void;
  kind: TenantRoleKindDiscriminant;
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
  const { t } = useTranslation('roles', {
    keyPrefix: 'form',
  });
  const formMethods = useForm<FormData>({ defaultValues });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  const handleAfterSubmit = (formData: FormData) => {
    const { name, scopeKinds, decryptOptions, vaultProxyConfigs } = formData;
    const decryptScopes = decryptOptions.map(({ value }) => DecryptOptionToTenantScope[value]);
    const vaultProxyScopes = vaultProxyConfigs.map(({ value }) => tenantScopeFromVaultProxyOption(value));
    // NOTE: Clunky solution. We need to do this becuase the values from the checkboxes (as specified by the DS)
    // must be strings, rather than TenantScopes
    const tenantScopeKinds = scopeKinds.map(s => ({ kind: s }) as unknown as TenantScope);

    // Add read scope if not present
    if (!tenantScopeKinds.some(s => s.kind === 'read')) {
      tenantScopeKinds.push({ kind: 'read' } as TenantScope);
    }
    const allScopes = [...tenantScopeKinds, ...decryptScopes, ...vaultProxyScopes];

    onSubmit({
      name,
      scopes: allScopes,
      kind,
    });
  };

  return (
    <FormProvider {...formMethods}>
      <form id="roles-form" onSubmit={handleSubmit(handleAfterSubmit)} className="w-full">
        <div className="mb-7">
          <FormComponent.Field>
            <FormComponent.Label>{t('name.label')}</FormComponent.Label>
            <FormComponent.Input
              autoFocus
              hasError={!!errors.name}
              placeholder={t('name.placeholder')}
              {...register('name', {
                required: {
                  value: true,
                  message: t('name.errors.required'),
                },
              })}
            />
            <FormComponent.Errors>{errors.name?.message}</FormComponent.Errors>
          </FormComponent.Field>
        </div>
        <Permissions kind={kind} />
      </form>
    </FormProvider>
  );
};

export default Form;
