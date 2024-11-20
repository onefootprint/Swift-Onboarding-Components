import { IcoCode16, IcoUser16 } from '@onefootprint/icons';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Form, RadioSelect, Stack, TextInput } from '@onefootprint/ui';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useOrgSession from 'src/hooks/use-org-session';

export type CopyHandler = {
  launch: () => void;
};

type FormData = {
  name: string;
  tenantId: string;
  mode: 'sandbox' | 'live';
};

export type FormProps = {
  onSubmit: (data: FormData & { tenantName: string }) => void;
  playbook: OnboardingConfiguration;
  tenants: {
    label: string;
    value: string;
    meta: {
      isProdKycPlaybookRestricted: boolean;
      isProdKybPlaybookRestricted: boolean;
    };
  }[];
};

const CopyForm = ({ onSubmit, playbook, tenants }: FormProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'copy' });
  const org = useOrgSession();
  const form = useForm<FormData>({
    defaultValues: {
      name: t('form.name.base', { name: playbook.name }),
      mode: 'sandbox',
      tenantId: tenants.find(tenant => tenant.value === org.dangerouslyCastedData.id)?.value,
    },
  });
  const selectedTenantId = form.watch('tenantId');
  const selectedTenant = tenants.find(tenant => tenant.value === selectedTenantId);

  const handleSubmit = (data: FormData) => {
    onSubmit({ ...data, tenantName: selectedTenant?.label || '' });
  };

  return (
    <form
      aria-label="Copy playbook"
      data-testid="copy-playbook-form"
      id="copy-playbook-form"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <Stack gap={7} direction="column">
        <TextInput
          autoFocus
          label={t('form.name.label')}
          placeholder={t('form.name.placeholder')}
          {...form.register('name', { required: true })}
        />
        {tenants.length > 1 && (
          <Form.Field>
            <Form.Label>{t('form.tenant.label')}</Form.Label>
            <Form.Select {...form.register('tenantId', { required: true })}>
              {tenants.map(tenant => (
                <option key={tenant.value} value={tenant.value}>
                  {tenant.label}
                </option>
              ))}
            </Form.Select>
          </Form.Field>
        )}
        <Controller
          control={form.control}
          name="mode"
          render={({ field }) => (
            <RadioSelect
              label={t('form.target.label')}
              onChange={field.onChange}
              options={[
                {
                  IconComponent: IcoCode16,
                  title: t('form.target.options.sandbox'),
                  value: 'sandbox',
                },
                {
                  disabled: selectedTenant?.meta.isProdKycPlaybookRestricted,
                  disabledHint: t('form.target.hint'),
                  IconComponent: IcoUser16,
                  title: t('form.target.options.live'),
                  value: 'live',
                },
              ]}
              size="compact"
              value={field.value}
            />
          )}
        />
      </Stack>
    </form>
  );
};

export default CopyForm;
