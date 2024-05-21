import '@onefootprint/footprint-js/dist/footprint-js.css';

import { Fp, useFootprint } from '@onefootprint/footprint-react';
import { Box } from '@onefootprint/ui';
import React, { useState } from 'react';

import DemoObStyles from './demo-ob-styles';

type DemoOnboardingComponentsProps = {
  step: string;
};

const Step1 = () => (
  <Fp.Form onSubmit={() => {}}>
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
  <Fp.Form onSubmit={() => {}}>
    <Fp.Field name="id.email">
      <Fp.Label>Your email</Fp.Label>
      <Fp.Input placeholder="lorem@footprint.com" />
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

const Step3 = () => (
  <>
    <DemoObStyles />
    <Fp.Form onSubmit={() => {}}>
      <Fp.Field name="id.email">
        <Fp.Label>Your email</Fp.Label>
        <Fp.Input placeholder="lorem@footprint.com" />
        <Fp.FieldErrors />
      </Fp.Field>
      <Fp.Field name="id.phone_number">
        <Fp.Label>Phone</Fp.Label>
        <Fp.Input />
        <Fp.FieldErrors />
      </Fp.Field>
      <button type="submit" className="fp-button">
        Continue
      </button>
    </Fp.Form>
  </>
);

const Step4 = () => {
  const fp = useFootprint();

  const handleSubmit = () => {
    fp.launchIdentify({
      onAuthenticated: () => {
        console.log('done');
      },
    });
  };

  return (
    <>
      <DemoObStyles />
      <Fp.Form onSubmit={handleSubmit}>
        <Fp.Field name="id.email">
          <Fp.Label>Your email</Fp.Label>
          <Fp.Input placeholder="lorem@footprint.com" />
          <Fp.FieldErrors />
        </Fp.Field>
        <Fp.Field name="id.phone_number">
          <Fp.Label>Phone</Fp.Label>
          <Fp.Input />
          <Fp.FieldErrors />
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

  const identify = () => {
    fp.launchIdentify({
      onAuthenticated: () => {
        setStep('collect-data');
      },
    });
  };

  const save = () => {
    fp.save({
      onSuccess: () => {
        console.log('done');
      },
    });
  };

  return (
    <>
      <DemoObStyles />
      {step === 'identify' && (
        <Fp.Form onSubmit={identify}>
          <Fp.Field name="id.email">
            <Fp.Label>Your email</Fp.Label>
            <Fp.Input placeholder="lorem@footprint.com" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.phone_number">
            <Fp.Label>Phone</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <button type="submit" className="fp-button">
            Continue
          </button>
        </Fp.Form>
      )}
      {step === 'collect-data' && (
        <Fp.Form onSubmit={save}>
          <Fp.Field name="id.first_name">
            <Fp.Label>First name</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.middle_name">
            <Fp.Label>Middle name</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.last_name">
            <Fp.Label>Last name</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.dob">
            <Fp.Label>DOB</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.country">
            <Fp.Label>Country</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.address_line1">
            <Fp.Label>Address line 1</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.address_line2">
            <Fp.Label>Address line 2 (optional)</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.city">
            <Fp.Label>City</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.zip">
            <Fp.Label>Zip code</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.state">
            <Fp.Label>State</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.ssn9">
            <Fp.Label>SSN9</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
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
  const [step, setStep] = useState<'identify' | 'collect-data'>('identify');

  const identify = () => {
    fp.launchIdentify({
      onAuthenticated: () => {
        setStep('collect-data');
      },
    });
  };

  const save = () => {
    fp.save({
      onSuccess: () => {
        fp.handoff({
          onComplete: validationToken => console.log(validationToken),
        });
      },
    });
  };

  return (
    <>
      <DemoObStyles />
      {step === 'identify' && (
        <Fp.Form onSubmit={identify}>
          <Fp.Field name="id.email">
            <Fp.Label>Your email</Fp.Label>
            <Fp.Input placeholder="lorem@footprint.com" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.phone_number">
            <Fp.Label>Phone</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <button type="submit" className="fp-button">
            Continue
          </button>
        </Fp.Form>
      )}
      {step === 'collect-data' && (
        <Fp.Form onSubmit={save}>
          <Fp.Field name="id.first_name">
            <Fp.Label>First name</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.middle_name">
            <Fp.Label>Middle name</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.last_name">
            <Fp.Label>Last name</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.dob">
            <Fp.Label>DOB</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.country">
            <Fp.Label>Country</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.address_line1">
            <Fp.Label>Address line 1</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.address_line2">
            <Fp.Label>Address line 2 (optional)</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.city">
            <Fp.Label>City</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.zip">
            <Fp.Label>Zip code</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.state">
            <Fp.Label>State</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.ssn9">
            <Fp.Label>SSN9</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
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

// const OLD = pb_test_hLKePSu5AH5wAYuZH2ehR7

const DemoObWithProvider = ({ step }: DemoOnboardingComponentsProps) => (
  <Fp.Provider publicKey="pb_test_ZaqkFwlwizObSzxUYvUjzK">
    <Paper>
      <DemoOnboardingComponents step={step} />
    </Paper>
  </Fp.Provider>
);

const Paper = ({ children }: React.PropsWithChildren) => (
  <Box
    padding={5}
    borderWidth={1}
    borderColor="primary"
    borderStyle="solid"
    borderRadius="default"
  >
    {children}
  </Box>
);

export default DemoObWithProvider;
