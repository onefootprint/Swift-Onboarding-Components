import Footer from '@/create-playbook/components/router/components/footer';
import { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { Stack } from '@onefootprint/ui';
import { FormProvider, useForm } from 'react-hook-form';
import OtpVerifications from './components/otp-verifications';

type StepRequiredAuthMethods = {
  defaultValues: DataToCollectFormData;
  onBack: () => void;
  onSubmit: (data: DataToCollectFormData) => void;
};

const StepRequiredAuthMethods = ({ defaultValues, onBack, onSubmit }: StepRequiredAuthMethods) => {
  const formMethods = useForm<DataToCollectFormData>({ defaultValues });
  const { handleSubmit } = formMethods;

  return (
    <Stack flexDirection="column" gap={8}>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} id="step-login-methods-form">
          <OtpVerifications />
        </form>
      </FormProvider>
      <Footer onBack={onBack} form="step-login-methods-form" />
    </Stack>
  );
};

export default StepRequiredAuthMethods;
