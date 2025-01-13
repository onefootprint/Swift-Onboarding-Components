import { Button, Checkbox, Text, TextInput } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import type { ClientTokenResponse } from 'src/hooks/use-client-token';
import useClientToken from 'src/hooks/use-client-token';

type FormData = {
  userId: string;
  secretKey: string;
  cardAlias: string;
  collectName: boolean;
  collectPartialAddress: boolean;
};

type CredsFormProps = {
  onSubmit: (authToken: string) => void;
};

const CredsForm = ({ onSubmit }: CredsFormProps) => {
  const clientTokenMutation = useClientToken();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      userId: 'fp_id_test_9fvIm0T1TiDFzwDCcxtBKL',
      cardAlias: 'primary',
      collectName: false,
      collectPartialAddress: false,
    },
  });

  const handleBeforeSubmit = (data: FormData) => {
    // Generate an auth token to use in the secure form
    clientTokenMutation.mutate(
      {
        ...data,
      },
      {
        onSuccess: (response: ClientTokenResponse) => {
          const authToken = response.token;
          onSubmit(authToken);
        },
      },
    );
  };

  return (
    <form className="flex flex-col gap-4 w-full max-w-[500px]" onSubmit={handleSubmit(handleBeforeSubmit)}>
      <TextInput
        autoFocus
        label="Footprint User Id (from prod)"
        placeholder="fp_123456789"
        hasError={!!errors.userId}
        hint={errors?.userId && 'Please enter a valid Footprint user ID'}
        {...register('userId', { required: true })}
      />
      <TextInput
        label="API Secret Key (from prod)"
        placeholder="sk_123456789"
        hasError={!!errors.secretKey}
        hint={errors?.secretKey && 'Please enter a valid API secret key'}
        {...register('secretKey', { required: true })}
      />
      <TextInput
        label="Card Alias"
        placeholder="primary"
        hasError={!!errors.cardAlias}
        hint={errors?.cardAlias && 'Please enter a valid card alias'}
        {...register('cardAlias', { required: true })}
      />
      <Text variant="body-3">Optional card fields to collect</Text>
      <Checkbox label="Name" {...register('collectName')} />
      <Checkbox label="Partial Address" {...register('collectPartialAddress')} />
      <Button loading={clientTokenMutation.isPending} type="submit">
        Continue
      </Button>
    </form>
  );
};

export default CredsForm;
