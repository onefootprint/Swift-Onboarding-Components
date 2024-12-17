import { FormProvider, useForm } from 'react-hook-form';
import type { ToolFormProps } from '../../toolbox';

type GrantEditRightsFormData = {};

const useGrantEditRightsForm = ({ formId }: ToolFormProps) => {
  const methods = useForm<GrantEditRightsFormData>();
  const { handleSubmit } = methods;

  const handleBeforeSubmit = async (data: GrantEditRightsFormData) => {
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

export default useGrantEditRightsForm;
