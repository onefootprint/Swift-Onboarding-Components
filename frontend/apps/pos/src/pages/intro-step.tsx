import { postHostedIdentifySignupChallengeMutation } from '@onefootprint/axios';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Button from '../components/ui/button';
import logo from '../images/avis.png';

type IntroStepProps = {
  onFillout: (data: FormData) => void;
};

type FormData = {
  email: string;
  phoneNumber: string;
};

const Intro = ({ onFillout }: IntroStepProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const mutation = useMutation(
    postHostedIdentifySignupChallengeMutation({
      headers: {
        'X-Fp-Is-Components-Sdk': true,
      },
    }),
  );

  const onSubmit = data => {
    mutation.mutate(
      {
        body: {
          phoneNumber: {
            value: data.phoneNumber,
            isBootstrap: false,
          },
          challengeKind: 'sms_link',
          scope: 'onboarding',
        },
      },
      {
        onSuccess: () => {
          onFillout(data);
        },
      },
    );
  };

  return (
    <div className="w-[500px] border border-gray-100 px-8 pt-8 pb-4">
      <header className="mb-6">
        <img src={logo} alt="Avis Logo" className="mx-auto mb-6" width={92} height={30} />
        <h1 className="text-heading-3 text-primary">Let's verify your customer's identity!</h1>
        <h2 className="text-body-2 text-secondary">
          Enter their email and phone number to begin the identity verification process.
        </h2>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="block w-full mb-6">
          <label className="block mb-2 text-label-3 text-primary text-left" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="w-full h-10 px-4 text-body-3 bg-white border border-gray-150 text-black outline-none hover:border-gray-300 focus:border-gray-600"
            placeholder="customer@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
          />
          {errors.email?.message && <p className="mt-1.5 text-sm text-error">{errors.email.message as string}</p>}
        </div>
        <div className="block w-full mb-6">
          <label className="block mb-2 text-label-3 text-primary text-left" htmlFor="phoneNumber">
            Phone number
          </label>
          <input
            id="phoneNumber"
            className="w-full h-10 px-4 text-body-3 bg-white border border-gray-150 text-black outline-none hover:border-gray-300 focus:border-gray-600"
            placeholder="+1 555-555-0100"
            {...register('phoneNumber', {
              required: 'Phone number is required',
              validate: (value: string) => {
                const cleanedNumber = value.replace(/\D/g, '');
                return (
                  (cleanedNumber.length >= 10 && cleanedNumber.length <= 15) || 'Please enter a valid phone number'
                );
              },
            })}
          />
          {errors.phoneNumber?.message && (
            <p className="mt-1.5 text-sm text-error">{errors.phoneNumber.message as string}</p>
          )}
          {mutation.error && <p className="mt-1.5 text-sm text-error">{mutation.error.message}</p>}
        </div>
        <div className="mt-3 mb-4">
          <Button variant="primary" type="submit" disabled={mutation.isPending || mutation.isPending}>
            {mutation.isPending ? 'Verifying...' : 'Continue'}
          </Button>
        </div>
        <div>
          <p className="text-body-3 text-tertiary text-center">
            They’ll receive a text message with a link to verify their phone number.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Intro;
