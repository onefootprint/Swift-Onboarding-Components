import { FormProvider, useForm } from 'react-hook-form';
import type { ToolFormProps } from '../../toolbox';

type SeeEmployeesWithEditRightsFormData = {};

const useSeeEmployeesWithEditRightsForm = ({ formId }: ToolFormProps) => {
  const methods = useForm<SeeEmployeesWithEditRightsFormData>();
  const { handleSubmit } = methods;

  const handleBeforeSubmit = async (data: SeeEmployeesWithEditRightsFormData) => {
    // TODO: Implement submission logic
    console.log(data);
  };

  const component = (
    <FormProvider {...methods}>
      <form id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
        PLACEHOLDER
      </form>
    </FormProvider>
  );

  return {
    component,
    isPending: false,
  };
};

export default useSeeEmployeesWithEditRightsForm;
