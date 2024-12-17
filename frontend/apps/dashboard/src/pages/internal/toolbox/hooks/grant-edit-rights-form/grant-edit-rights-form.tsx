import { getOrgMembersOptions, postPrivateAccessRequestsMutation } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import type { TenantScope } from '@onefootprint/request-types/dashboard';
import { Form, MultiSelect, useToast } from '@onefootprint/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import useSession from 'src/hooks/use-session';
import type { ToolFormProps } from '../../toolbox';
import useTenantScopeOptions from './hooks/use-tenant-scope-options';

type GrantEditRightsFormData = {
  requester: string;
  scopes: TenantScope[];
  duration: number;
  reason?: string;
};

const useGrantEditRightsForm = ({ formId, onClose }: ToolFormProps) => {
  const methods = useForm<GrantEditRightsFormData>();
  const { handleSubmit, register } = methods;
  const mutation = useMutation(postPrivateAccessRequestsMutation({ throwOnError: true }));
  const { data: session } = useSession();
  const { data: employees } = useQuery(getOrgMembersOptions());
  const tenantId = session?.org?.id ?? '';
  const scopeOptions = useTenantScopeOptions();
  const toast = useToast();

  const employeeOptions =
    employees?.data.map(employee => ({
      value: employee.id,
      label: `${employee.firstName} ${employee.lastName}`,
    })) ?? [];

  const handleBeforeSubmit = (data: GrantEditRightsFormData) => {
    mutation.mutate(
      {
        body: {
          scopes: data.scopes,
          durationHours: Number(data.duration),
          reason: data.reason,
          tenantId: tenantId,
        },
      },
      {
        onSuccess: () => {
          toast.show({
            title: 'Edit rights granted successfully',
            description: 'The employee has been granted edit rights',
          });
          onClose();
        },
        onError: (e: Error) => {
          toast.show({
            title: 'Error granting edit rights',
            description: getErrorMessage(e),
          });
        },
      },
    );
  };

  const component = (
    <FormProvider {...methods}>
      <form id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <div className="flex flex-col gap-5">
          <Form.Field>
            <Form.Label>Employee</Form.Label>
            <Form.Select size="compact" {...register('requester')}>
              {employeeOptions.map(employee => (
                <option key={employee.value} value={employee.value}>
                  {employee.label}
                </option>
              ))}
            </Form.Select>
          </Form.Field>
          <div className="flex bg-secondary rounded p-4 gap-6 flex-col">
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
          </div>
        </div>
      </form>
    </FormProvider>
  );

  return {
    component,
    isPending: mutation.isPending,
  };
};

export default useGrantEditRightsForm;
