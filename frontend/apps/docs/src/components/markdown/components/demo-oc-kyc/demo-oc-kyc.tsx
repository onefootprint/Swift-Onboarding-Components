import '@onefootprint/footprint-js/dist/footprint-js.css';

import {
  type FormValues,
  Fp,
  InlineOtpNotSupported,
  InlineProcessError,
  useFootprint,
} from '@onefootprint/footprint-react';
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
  const fp = useFootprint();
  const [showOtp, setShowOtp] = useState(false);
  const [challengeKind, setChallengeKind] = useState<string>('');

  const handleCreateChallenge = async (formValues: FormValues) => {
    const email = formValues['id.email'];
    const phoneNumber = formValues['id.phone_number'];
    try {
      const method = await fp.createEmailPhoneBasedChallenge({ email, phoneNumber });
      setChallengeKind(method);
      console.log(method);
      setShowOtp(true);
    } catch (e) {
      if (e instanceof InlineOtpNotSupported) {
        await fp.launchIdentify(
          { email, phoneNumber },
          {
            onAuthenticated() {
              console.log('Authenticated');
            },
          },
        );
      }
    }
  };

  const handleSubmitPin = async (verificationCode: string) => {
    try {
      const response = await fp.verify({ verificationCode });
      console.log(response);
      console.log('Authenticated');
    } catch (error) {
      console.error('Error verifying pin:', error);
    }
  };

  if (!fp.isReady) {
    return <div>Loading...</div>;
  }

  if (showOtp) {
    return (
      <div>
        <Styles />
        <div>Verify your phone number</div>
        <div>Enter the 6-digit code sent from {challengeKind}</div>
        <Fp.PinInput onComplete={handleSubmitPin} autoFocus />
      </div>
    );
  }

  return (
    <>
      <Styles />
      <Fp.Form onSubmit={handleCreateChallenge} className="fp-c-form">
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
  const fp = useFootprint();
  const [step, setStep] = useState<'identify' | 'collect-data'>('identify');
  const [showOtp, setShowOtp] = useState(false);
  const [challengeKind, setChallengeKind] = useState<string>('');

  const handleCreateChallenge = async (formValues: FormValues) => {
    const email = formValues['id.email'];
    const phoneNumber = formValues['id.phone_number'];
    try {
      const method = await fp.createEmailPhoneBasedChallenge({ email, phoneNumber });
      setChallengeKind(method);
      console.log(method);
      setShowOtp(true);
    } catch (e) {
      if (e instanceof InlineOtpNotSupported) {
        await fp.launchIdentify(
          { email, phoneNumber },
          {
            onAuthenticated() {
              console.log('Authenticated');
              setStep('collect-data');
            },
          },
        );
      }
    }
  };

  const handleSubmitPin = async (verificationCode: string) => {
    try {
      const response = await fp.verify({ verificationCode });
      console.log(response);
      console.log('Authenticated');
      setStep('collect-data');
    } catch (error) {
      console.error('Error verifying pin:', error);
    }
  };

  const handleSubmitData = async (formValues: FormValues) => {
    try {
      await fp.vault(formValues);
      const remainingRequirements = await fp.getRequirements();
      console.log('Saved data. Remaining requirements:', remainingRequirements);
    } catch (e) {
      console.log(e);
    }
  };

  if (!fp.isReady) {
    return <div>Loading...</div>;
  }

  if (showOtp && step === 'identify') {
    return (
      <div>
        <Styles />
        <div>Verify your phone number</div>
        <div>Enter the 6-digit code sent from {challengeKind}</div>
        <Fp.PinInput onComplete={handleSubmitPin} autoFocus />
      </div>
    );
  }

  return (
    <>
      <Styles />
      {step === 'identify' && (
        <Fp.Form onSubmit={handleCreateChallenge} className="fp-c-form">
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
          <Fp.Field name="id.country">
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
            Continue
          </button>
        </Fp.Form>
      )}
    </>
  );
};

const Step6 = () => {
  const fp = useFootprint();
  const [step, setStep] = useState<'identify' | 'collect-data'>('identify');
  const [showOtp, setShowOtp] = useState(false);
  const [challengeKind, setChallengeKind] = useState<string>('');

  const handleCreateChallenge = async (formValues: FormValues) => {
    const email = formValues['id.email'];
    const phoneNumber = formValues['id.phone_number'];
    try {
      const method = await fp.createEmailPhoneBasedChallenge({ email, phoneNumber });
      setChallengeKind(method);
      console.log(method);
      setShowOtp(true);
    } catch (e) {
      if (e instanceof InlineOtpNotSupported) {
        await fp.launchIdentify(
          { email, phoneNumber },
          {
            onAuthenticated() {
              console.log('Authenticated');
              setStep('collect-data');
            },
          },
        );
      }
    }
  };

  const handleSubmitPin = async (verificationCode: string) => {
    try {
      const response = await fp.verify({ verificationCode });
      console.log(response);
      console.log('Authenticated');
      setStep('collect-data');
    } catch (error) {
      console.error('Error verifying pin:', error);
    }
  };

  const handleSubmitData = async (formValues: FormValues) => {
    try {
      await fp.vault(formValues);
      const remainingRequirements = await fp.getRequirements();
      console.log('Saved data. Remaining requirements:', remainingRequirements);
      const { validationToken } = await fp.process();
      console.log('Validation token:', validationToken);
    } catch (e) {
      if (e instanceof InlineProcessError) {
        fp.handoff({ onComplete: validationToken => console.log('Validation token:', validationToken) });
      }
    }
  };

  if (!fp.isReady) {
    return <div>Loading...</div>;
  }

  if (showOtp && step === 'identify') {
    return (
      <div>
        <Styles />
        <div>Verify your phone number</div>
        <div>Enter the 6-digit code sent from {challengeKind}</div>
        <Fp.PinInput onComplete={handleSubmitPin} autoFocus />
      </div>
    );
  }

  return (
    <>
      <Styles />
      {step === 'identify' && (
        <Fp.Form onSubmit={handleCreateChallenge} className="fp-c-form">
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
            Continue
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
