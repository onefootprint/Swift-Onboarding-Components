import { postHostedIdentifySignupChallengeMutation } from '@onefootprint/axios';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Header from '../../components/header';
import Layout from '../../components/layout';
import Button from '../../components/ui/button';
import FormError from '../../components/ui/form-error';
import FormInput from '../../components/ui/form-input';
import FormLabel from '../../components/ui/form-label';
import FormSelect from '../../components/ui/form-select';
import logo from '../../images/avis.png';
import { COUNTRY_CODES } from './intro-steps.constants';
import { getClassNames } from './intro-steps.utils';

type IntroStepProps = {
  onDone: (data: FormData) => void;
};

type FormData = {
  email: string;
  countryCode: string;
  phoneNumber: string;
};

const Intro = ({ onDone }: IntroStepProps) => {
  const [focusedField, setFocusedField] = useState<'phone' | 'select' | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      countryCode: '+1',
    },
  });
  const mutation = useMutation(
    postHostedIdentifySignupChallengeMutation({
      headers: {
        'X-Fp-Is-Components-Sdk': true,
      },
    }),
  );
  const classNames = getClassNames(focusedField);

  const onSubmit = (formData: FormData) => {
    const phoneNumber = `${formData.countryCode}${formData.phoneNumber}`;
    mutation.mutate(
      {
        body: {
          phoneNumber: {
            value: phoneNumber,
            isBootstrap: false,
          },
          challengeKind: 'sms_link',
          scope: 'onboarding',
        },
      },
      {
        onSuccess: () => {
          onDone(formData);
        },
      },
    );
  };

  return (
    <Layout>
      <img src={logo} alt="Avis Logo" className="mx-auto mb-6" width={92} height={30} />
      <Header
        title="Let's verify your customer's identity!"
        subtitle="Enter their email and phone number to begin the identity verification process."
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            autoFocus
            id="email"
            type="email"
            placeholder="customer@example.com"
            spellCheck="false"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
          />
          <FormError>{errors.email?.message}</FormError>
        </div>
        <div className="block w-full mb-6">
          <FormLabel htmlFor="phoneNumber">Phone number</FormLabel>
          <FormSelect
            id="countryCode"
            aria-label="Country code"
            className={classNames.select}
            onFocus={() => setFocusedField('select')}
            onBlur={() => setFocusedField(null)}
            {...register('countryCode', {
              required: 'Country code is required',
            })}
          >
            {COUNTRY_CODES.map(countryCode => (
              <option key={countryCode.value} value={countryCode.value}>
                {countryCode.label}
              </option>
            ))}
          </FormSelect>
          <FormInput
            id="phoneNumber"
            type="tel"
            placeholder="555-555-0100"
            className={classNames.phone}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            {...register('phoneNumber', {
              required: 'Phone number is required',
              validate: (value: string) => {
                const cleanedNumber = value.replace(/\D/g, '');
                return cleanedNumber.length === 10 || 'Please enter a valid 10-digit phone number';
              },
            })}
          />
          <FormError>{errors.phoneNumber?.message}</FormError>
          <FormError>{mutation.error?.message}</FormError>
        </div>
        <div className="mt-3 mb-4">
          <Button variant="primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Loading...' : 'Continue'}
          </Button>
        </div>
        <div>
          <p className="text-body-3 text-tertiary text-center">
            They'll receive a text message with a link to verify their phone number.
          </p>
        </div>
      </form>
    </Layout>
  );
};

export default Intro;
