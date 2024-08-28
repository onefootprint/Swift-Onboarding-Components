import '@onefootprint/footprint-js/dist/footprint-js.css';

import { type FormValues, Fp, useFootprint, useOtp } from '@onefootprint/footprint-react';
import { Box } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';

import Styles from './demo-oc-kyc-styles';

type DemoOnboardingComponentsProps = {
  step: string;
};

const Step1 = () => (
  <Fp.Form onSubmit={() => undefined}>
    <Fp.Field name="id.email">
      <Fp.Label>Email</Fp.Label>
      <Fp.Input />
      <Fp.FieldErrors />
    </Fp.Field>
    <Fp.Field name="id.phone_number">
      <Fp.Label>Phone</Fp.Label>
      <Fp.Input />
      <Fp.FieldErrors />
    </Fp.Field>
    <button type="submit">Continue</button>
  </Fp.Form>
);

const Step2 = () => (
  <Fp.Form onSubmit={() => undefined}>
    <Fp.Field name="id.email">
      <Fp.Label>Your email</Fp.Label>
      <Fp.Input placeholder="jane@acme.com" />
      <Fp.FieldErrors />
    </Fp.Field>
    <Fp.Field name="id.phone_number">
      <Fp.Label>Phone</Fp.Label>
      <Fp.Input placeholder="(123) 456-7890" />
      <Fp.FieldErrors />
    </Fp.Field>
    <button type="submit">Continue</button>
  </Fp.Form>
);

const Step3 = () => (
  <>
    <Styles />
    <Fp.Form onSubmit={() => undefined} className="fp-c-form">
      <Fp.Field name="id.email" className="fp-c-field">
        <Fp.Label className="fp-c-label">Your email</Fp.Label>
        <Fp.Input className="fp-c-input" placeholder="jane@acme.com" />
        <Fp.FieldErrors className="fp-c-field-errors" />
      </Fp.Field>
      <Fp.Field name="id.phone_number" className="fp-c-field">
        <Fp.Label className="fp-c-label">Phone</Fp.Label>
        <Fp.Input className="fp-c-input" placeholder="(123) 456-7890" />
        <Fp.FieldErrors className="fp-c-field-errors" />
      </Fp.Field>
      <button type="submit" className="fp-button">
        Continue
      </button>
    </Fp.Form>
  </>
);

const Step4 = () => {
  const otp = useOtp();

  const handleSubmit = (formValues: FormValues) => {
    otp.launchIdentify(
      {
        email: formValues['id.email'],
        phoneNumber: formValues['id.phone_number'],
      },
      {
        onAuthenticated: () => {
          console.log('done');
        },
      },
    );
  };

  return (
    <>
      <Styles />
      <Fp.Form onSubmit={handleSubmit} className="fp-c-form">
        <Fp.Field name="id.email" className="fp-c-field">
          <Fp.Label className="fp-c-label">Your email</Fp.Label>
          <Fp.Input className="fp-c-input" placeholder="jane@acme.com" />
          <Fp.FieldErrors className="fp-c-field-errors" />
        </Fp.Field>
        <Fp.Field name="id.phone_number" className="fp-c-field">
          <Fp.Label className="fp-c-label">Phone</Fp.Label>
          <Fp.Input className="fp-c-input" placeholder="(123) 456-7890" />
          <Fp.FieldErrors className="fp-c-field-errors" />
        </Fp.Field>
        <button type="submit" className="fp-button">
          Continue
        </button>
      </Fp.Form>
    </>
  );
};

const Step5 = () => {
  const otp = useOtp();
  const fp = useFootprint();
  const [step, setStep] = useState<'identify' | 'collect-data'>('identify');

  const handleSubmitIdentify = (formValues: FormValues) => {
    otp.launchIdentify(
      {
        email: formValues['id.email'],
        phoneNumber: formValues['id.phone_number'],
      },
      {
        onAuthenticated: () => {
          setStep('collect-data');
        },
      },
    );
  };

  const handleSubmitData = (formValues: FormValues) => {
    fp.save(formValues, {
      onSuccess: () => {
        console.log('done');
      },
    });
  };

  return (
    <>
      <Styles />
      {step === 'identify' && (
        <Fp.Form onSubmit={handleSubmitIdentify} className="fp-c-form">
          <Fp.Field name="id.email" className="fp-c-field">
            <Fp.Label className="fp-c-label">Your email</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="jane@acme.com" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.phone_number" className="fp-c-field">
            <Fp.Label className="fp-c-label">Phone</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="(123) 456-7890" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <button type="submit" className="fp-button">
            Continue
          </button>
        </Fp.Form>
      )}
      {step === 'collect-data' && (
        <Fp.Form onSubmit={handleSubmitData} className="fp-c-form">
          <Fp.Field name="id.first_name" className="fp-c-field">
            <Fp.Label className="fp-c-label">First name</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Jane" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.middle_name" className="fp-c-field">
            <Fp.Label className="fp-c-label">Middle name</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Sue" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.last_name" className="fp-c-field">
            <Fp.Label className="fp-c-label">Last name</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Doe" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.dob" className="fp-c-field">
            <Fp.Label className="fp-c-label">DOB</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="MM/DD/YYYY" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="business.country">
            <Fp.Input placeholder="US" defaultValue="US" type="hidden" />
          </Fp.Field>
          <Fp.Field name="id.address_line1" className="fp-c-field">
            <Fp.Label className="fp-c-label">Address line 1</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Street number" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.address_line2" className="fp-c-field">
            <Fp.Label className="fp-c-label">Address line 2 (optional)</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Apartment, suite, etc." />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.city" className="fp-c-field">
            <Fp.Label className="fp-c-label">City</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="New York" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.zip" className="fp-c-field">
            <Fp.Label className="fp-c-label">Zip code</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="11206" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.state" className="fp-c-field">
            <Fp.Label className="fp-c-label">State</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="NY" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.ssn9" className="fp-c-field">
            <Fp.Label className="fp-c-label">SSN9</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="XXX-XX-XXXX" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <button type="submit" className="fp-button">
            {fp.busy === 'save' ? 'Saving...' : 'Continue'}
          </button>
        </Fp.Form>
      )}
    </>
  );
};

const Step6 = () => {
  const fp = useFootprint();
  const otp = useOtp();
  const [step, setStep] = useState<'identify' | 'collect-data'>('identify');

  const handleSubmitIdentify = (formValues: FormValues) => {
    otp.launchIdentify(
      {
        email: formValues['id.email'],
        phoneNumber: formValues['id.phone_number'],
      },
      {
        onAuthenticated: () => {
          setStep('collect-data');
        },
      },
    );
  };

  const handleSubmitData = (formValues: FormValues) => {
    fp.save(formValues, {
      onSuccess: fp.handoff,
    });
  };

  return (
    <>
      <Styles />
      {step === 'identify' && (
        <Fp.Form onSubmit={handleSubmitIdentify} className="fp-c-form">
          <Fp.Field name="id.email" className="fp-c-field">
            <Fp.Label className="fp-c-label">Your email</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="jane@acme.com" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.phone_number" className="fp-c-field">
            <Fp.Label className="fp-c-label">Phone</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="(123) 456-7890" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <button type="submit" className="fp-button">
            Continue
          </button>
        </Fp.Form>
      )}
      {step === 'collect-data' && (
        <Fp.Form onSubmit={handleSubmitData} className="fp-c-form">
          <Fp.Field name="id.first_name" className="fp-c-field">
            <Fp.Label className="fp-c-label">First name</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Jane" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.middle_name" className="fp-c-field">
            <Fp.Label className="fp-c-label">Middle name</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Sue" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.last_name" className="fp-c-field">
            <Fp.Label className="fp-c-label">Last name</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Doe" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.dob" className="fp-c-field">
            <Fp.Label className="fp-c-label">DOB</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="MM/DD/YYYY" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.country" className="fp-c-field">
            <Fp.Label className="fp-c-label">Country</Fp.Label>
            <Fp.Input className="fp-c-input" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.address_line1" className="fp-c-field">
            <Fp.Label className="fp-c-label">Address line 1</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Street number" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.address_line2" className="fp-c-field">
            <Fp.Label className="fp-c-label">Address line 2 (optional)</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="Apartment, suite, etc." />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.city" className="fp-c-field">
            <Fp.Label className="fp-c-label">City</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="New York" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.zip" className="fp-c-field">
            <Fp.Label className="fp-c-label">Zip code</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="11206" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.state" className="fp-c-field">
            <Fp.Label className="fp-c-label">State</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="NY" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <Fp.Field name="id.ssn9" className="fp-c-field">
            <Fp.Label className="fp-c-label">SSN9</Fp.Label>
            <Fp.Input className="fp-c-input" placeholder="XXX-XX-XXXX" />
            <Fp.FieldErrors className="fp-c-field-errors" />
          </Fp.Field>
          <button type="submit" className="fp-button">
            {fp.busy === 'save' ? 'Saving...' : 'Continue'}
          </button>
        </Fp.Form>
      )}
    </>
  );
};

const DemoOnboardingComponents = ({ step }: DemoOnboardingComponentsProps) => {
  if (step === '1') {
    return <Step1 />;
  }
  if (step === '2') {
    return <Step2 />;
  }
  if (step === '3') {
    return <Step3 />;
  }
  if (step === '4') {
    return <Step4 />;
  }
  if (step === '5') {
    return <Step5 />;
  }
  if (step === '6') {
    return <Step6 />;
  }

  return null;
};

const publicKey = process.env.NEXT_PUBLIC_KYC_KEY || '';

const DemoObWithProvider = ({ step }: DemoOnboardingComponentsProps) => (
  <Fp.Provider publicKey={publicKey}>
    <Paper>
      <DemoOnboardingComponents step={step} />
    </Paper>
  </Fp.Provider>
);

const Paper = ({ children }: React.PropsWithChildren) => (
  <Box padding={5} borderWidth={1} borderColor="primary" borderStyle="solid" borderRadius="default">
    {children}
  </Box>
);

export default DemoObWithProvider;
