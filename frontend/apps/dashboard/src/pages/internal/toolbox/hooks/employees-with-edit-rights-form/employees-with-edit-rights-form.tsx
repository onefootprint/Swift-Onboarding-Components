import { getPrivateAccessRequestsOptions } from '@onefootprint/axios/dashboard';
import type { AccessRequest } from '@onefootprint/request-types/dashboard';
import { Table } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import type { ToolFormProps } from '../../toolbox';
import Row from './components/row';

type SeeEmployeesWithEditRightsFormData = {};

const useSeeEmployeesWithEditRightsForm = ({ formId }: ToolFormProps) => {
  const methods = useForm<SeeEmployeesWithEditRightsFormData>();
  const { handleSubmit } = methods;
  const { data, isPending } = useQuery(getPrivateAccessRequestsOptions());

  const handleBeforeSubmit = async (data: SeeEmployeesWithEditRightsFormData) => {
    // TODO: Implement submission logic
    console.log(data);
  };

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      text: 'Employee',
      width: '20%',
    },
    {
      key: 'permissibleAttributes',
      label: 'Permissible Attributes',
      text: 'Permissible Attributes',
      width: '47.5%',
    },
    {
      key: 'editRightsDuration',
      label: 'Edit Rights Duration',
      text: 'Edit Rights Duration',
      width: '25%',
    },
    {
      key: 'actions',
      label: '',
      text: '',
      width: '7.5%',
    },
  ];

  const component = (
    <FormProvider {...methods}>
      <form id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        <div className="flex flex-col gap-5 px-52">
          <div className="flex flex-col gap-1">
            <h2 className="text-heading-2 text-primary">Employees with edit rights</h2>
            <p className="text-body-2 text-secondary">View a list of employees and their assigned edit rights.</p>
          </div>
          <Table<AccessRequest>
            aria-label="Employees with edit rights"
            columns={columns}
            getKeyForRow={() => ''}
            isLoading={isPending}
            items={data}
            renderTr={({ item: accessRequest }) => <Row accessRequest={accessRequest} />}
          />
        </div>
      </form>
    </FormProvider>
  );

  return {
    component,
    isPending,
  };
};

export default useSeeEmployeesWithEditRightsForm;
