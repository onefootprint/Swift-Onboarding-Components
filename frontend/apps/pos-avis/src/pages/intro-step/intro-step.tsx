import { postHostedIdentifySessionChallengeMutation, postHostedIdentifySessionMutation } from '@onefootprint/axios';
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
  onDone: ({
    token,
    challengeToken,
    email,
    phoneNumber,
  }: { token: string; challengeToken: string; email: string; phoneNumber: string }) => void;
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
  // TODO: playbook key, sandbox ID, etc
  const startSession = useMutation(postHostedIdentifySessionMutation());
  const createChallenge = useMutation(postHostedIdentifySessionChallengeMutation());
  const classNames = getClassNames(focusedField);

  const onSubmit = async (formData: FormData) => {
    const phoneNumber = `${formData.countryCode}${formData.phoneNumber}`;
    const sessionData = await startSession.mutateAsync({
      body: {
        data: {
          'id.phone_number': phoneNumber,
          'id.email': formData.email,
        },
        scope: 'onboarding',
      },
    });
    const challengeData = await createChallenge.mutateAsync({
      headers: { 'X-Fp-Authorization': sessionData.token },
      body: { challengeKind: 'sms_link' },
    });
    onDone({
      challengeToken: challengeData.challengeData.challengeToken,
      token: sessionData.token,
      email: formData.email,
      phoneNumber: phoneNumber,
    });
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
            {COUNTRY_CODES.map((countryCode, index) => (
              <option key={`${countryCode.value}-${index}`} value={countryCode.value}>
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
            })}
          />
          <FormError>{errors.phoneNumber?.message}</FormError>
          <FormError>{startSession.error?.message || createChallenge.error?.message}</FormError>
        </div>
        <div className="mt-3 mb-4">
          <Button variant="primary" type="submit" disabled={startSession.isPending || createChallenge.isPending}>
            {startSession.isPending || createChallenge.isPending ? 'Loading...' : 'Continue'}
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
