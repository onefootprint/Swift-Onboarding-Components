import { patchHostedUserVaultMutation } from '@onefootprint/axios';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Header from '../../components/header';
import Layout from '../../components/layout';
import Button from '../../components/ui/button';
import FormError from '../../components/ui/form-error';
import FormInput from '../../components/ui/form-input';
import FormLabel from '../../components/ui/form-label';
import type { FormData } from '../../types/form-data';
import transformDataBeforeVault from '../../utils/transform-data-before-vault';

type BasicDataStepProps = {
  authToken: string;
  defaultValues: FormData;
  onSubmit: (data: FormData) => void;
};

const BasicDataStep = ({ authToken, defaultValues, onSubmit }: BasicDataStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: defaultValues.firstName || '',
      middleName: defaultValues.middleName || '',
      lastName: defaultValues.lastName || '',
      dob: defaultValues.dob || '',
    },
  });
  const mutation = useMutation(
    patchHostedUserVaultMutation({
      headers: {
        'X-Fp-Authorization': authToken,
      },
    }),
  );

  const onFormSubmit = async (formData: FormData) => {
    const transformedData = transformDataBeforeVault(formData);
    mutation.mutateAsync(
      {
        body: {
          'id.first_name': transformedData.firstName,
          'id.middle_name': transformedData.middleName,
          'id.last_name': transformedData.lastName,
          'id.dob': transformedData.dob,
        },
      },
      {
        onSuccess: () => {
          onSubmit(formData);
        },
      },
    );
  };

  return (
    <Layout>
      <Header title="Basic data" subtitle="We're legally required to collect this information." />
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <FormLabel htmlFor="firstName">First name *</FormLabel>
            <FormInput
              id="firstName"
              placeholder="Jane"
              {...register('firstName', {
                required: 'First name is required',
              })}
            />
            <FormError>{errors.firstName?.message}</FormError>
          </div>
          <div className="flex-1">
            <FormLabel htmlFor="middleName">Middle name</FormLabel>
            <FormInput id="middleName" placeholder="Sue" {...register('middleName')} />
          </div>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="lastName">Last name *</FormLabel>
          <FormInput
            id="lastName"
            placeholder="Doe"
            {...register('lastName', {
              required: 'Last name is required',
            })}
          />
          <FormError>{errors.lastName?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="dob">Date of birth *</FormLabel>
          <FormInput
            id="dob"
            placeholder="MM/DD/YYYY"
            {...register('dob', {
              required: 'Date of birth is required',
            })}
          />
          <FormError>{errors.dob?.message}</FormError>
        </div>
        <FormError>{mutation.error?.message}</FormError>
        <div className="mt-3 mb-4">
          <Button variant="primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default BasicDataStep;
