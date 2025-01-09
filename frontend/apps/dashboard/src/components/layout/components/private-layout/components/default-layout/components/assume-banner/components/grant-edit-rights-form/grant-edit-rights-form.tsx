import { postPrivateAccessRequestsMutation } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { Button, Form, MultiSelect, useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import useSession from 'src/hooks/use-session';
import useTenantScopeOptions from './hooks/use-tenant-scope-options';

type GrantEditRightsFormData = {
  requester: string;
  scopes: TenantScope[];
  duration: number;
  reason?: string;
};

type GrantEditRightsFormProps = {
  onClose: () => void;
};

const GrantEditRightsForm = ({ onClose }: GrantEditRightsFormProps) => {
  const methods = useForm<GrantEditRightsFormData>();
  const { handleSubmit, register } = methods;
  const scopeOptions = useTenantScopeOptions();
  const { data: session } = useSession();
  const mutation = useMutation(postPrivateAccessRequestsMutation({ throwOnError: true }));
  const tenantId = session?.org?.id ?? '';
  const toast = useToast();

  const onSubmit = (data: GrantEditRightsFormData) => {
    mutation.mutate(
      {
        body: {
          scopes: data.scopes,
          durationHours: Number(data.duration * 24),
          reason: data.reason,
          tenantId: tenantId,
        },
      },
      {
        onSuccess: () => {
          toast.show({
            title: 'Edit grant requested',
            description: 'A Risk Ops manager will review your request shortly.',
          });
          onClose();
        },
        onError: (e: Error) => {
          toast.show({
            title: 'Error requesting edit rights.',
            description: getErrorMessage(e),
          });
        },
      },
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-5">
          <Form.Field>
            <Form.Label>Permissible attributes</Form.Label>
            <Controller
              control={methods.control}
              name="scopes"
              render={({ field }) => (
                <MultiSelect
                  size="compact"
                  placeholder="Select..."
                  options={scopeOptions.options}
                  onChange={value => field.onChange(value.map(v => ({ kind: v.value })))}
                  value={field.value?.map(scope => {
                    const option = scopeOptions.options
                      .find(g => g.options.some(o => o.value === scope.kind))
                      ?.options.find(o => o.value === scope.kind);
                    return {
                      value: scope.kind,
                      label: option?.label ?? '',
                    };
                  })}
                />
              )}
            />
            <Form.Hint>Select the attributes the employee can decrypt.</Form.Hint>
          </Form.Field>
          <Form.Field>
            <Form.Label>Edit rights duration</Form.Label>
            <Form.Input size="compact" type="number" {...register('duration')} placeholder="1" />
            <Form.Hint>Specify the number of days the employee will have edit rights for.</Form.Hint>
          </Form.Field>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default GrantEditRightsForm;
