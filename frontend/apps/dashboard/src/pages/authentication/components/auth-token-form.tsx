import { Button, Form } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';
import useSession from 'src/hooks/use-session';

type FormData = {
  authToken: string;
};

const EmailForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const { logIn } = useSession();
  const onSubmit = async ({ authToken }: FormData) => {
    await logIn({ auth: authToken });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <Form.Field>
          <Form.Label>[DEV ONLY] Auth token copied from another session</Form.Label>
          <Form.Input
            autoComplete="authToken"
            hasError={!!errors.authToken}
            placeholder="Auth token"
            type="text"
            {...register('authToken', { required: 'Auth token is required' })}
          />
          <Form.Errors>{errors?.authToken?.message}</Form.Errors>
        </Form.Field>
        <Button fullWidth size="large" type="submit">
          Inherit existing session
        </Button>
      </div>
    </form>
  );
};

export default EmailForm;
