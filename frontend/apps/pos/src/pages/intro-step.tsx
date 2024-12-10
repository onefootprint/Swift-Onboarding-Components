import { postHostedIdentifySignupChallengeMutation } from '@onefootprint/axios';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
    <div className="app-form intro-step">
      <header className="header">
        <img src={logo} alt="Avis Logo" className="logo" width={92} height={30} />
        <h1 className="title">Let's verify your customer's identity!</h1>
        <h2 className="subtitle">Enter their email and phone number to begin the identity verification process.</h2>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-field">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="form-input"
            placeholder="customer@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
          />
          {errors.email?.message && <p className="form-error">{errors.email.message as string}</p>}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="phoneNumber">
            Phone number
          </label>
          <input
            id="phoneNumber"
            className="form-input"
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
          {errors.phoneNumber?.message && <p className="form-error">{errors.phoneNumber.message as string}</p>}
          {mutation.error && <p className="form-error">{mutation.error.message}</p>}
        </div>
        <div className="form-button">
          <button type="submit" className="button button-primary" disabled={mutation.isPending || mutation.isPending}>
            {mutation.isPending ? 'Verifying...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Intro;
