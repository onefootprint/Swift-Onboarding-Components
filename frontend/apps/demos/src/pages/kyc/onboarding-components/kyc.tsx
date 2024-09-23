import type { FormValues } from '@onefootprint/footprint-react';
import { Fp, InlineProcessError, useFootprint } from '@onefootprint/footprint-react';
import { Box, Button, Container, Divider, LoadingSpinner, Stack, Stepper, Text } from '@onefootprint/ui';
import { useState } from 'react';

import Header from './components/header';
import Layout from './components/layout';
import GlobalStyles from './kyc.styles';

const steps = [
  {
    label: 'Identify',
    value: 'identify',
  },
  {
    label: 'Personal data',
    value: 'personal-data',
  },
  {
    label: 'Address',
    value: 'address',
  },
  {
    label: 'Confirmation',
    value: 'confirmation',
  },
];

const publicKeyEnv = process.env.NEXT_PUBLIC_KYC_KEY || 'pb_test_Rf4pMIvfohE1qvzgPv3RwG';

const Demo = () => {
  const [option, setOption] = useState(steps[0]);

  const isIdentify = option.value === 'identify';
  const isPersonalData = option.value === 'personal-data';
  const isAddress = option.value === 'address';
  const isSuccess = option.value === 'confirmation';

  return (
    <>
      <GlobalStyles />
      <Fp.Provider publicKey={publicKeyEnv}>
        <Header>Onboarding</Header>
        <Container>
          <Stack marginTop={7} gap={8}>
            <Stepper onChange={() => undefined} value={{ option }} aria-label="Steps" options={steps} />
            <Box>
              {isIdentify && (
                <Identify
                  onDone={() => {
                    setOption(steps[1]);
                  }}
                />
              )}
              {isPersonalData && (
                <PersonalData
                  onDone={() => {
                    setOption(steps[2]);
                  }}
                />
              )}
              {isAddress && (
                <Address
                  onDone={(validationToken: string) => {
                    console.log(validationToken);
                    setOption(steps[3]);
                  }}
                />
              )}
              {isSuccess && <Success />}
            </Box>
          </Stack>
        </Container>
      </Fp.Provider>
    </>
  );
};

const Identify = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();
  const [busy, setBusy] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmitData = async (formValues: FormValues) => {
    const email = formValues['id.email'];
    const phoneNumber = formValues['id.phone_number'];
    if (!email || !phoneNumber) return null;

    try {
      setBusy(true);
      setPhoneNumber(phoneNumber);
      await fp.createEmailPhoneBasedChallenge({ email, phoneNumber });
      setShowOtp(true);
    } catch (e) {
      console.log(e);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitPin = async (verificationCode: string) => {
    try {
      setBusy(true);
      const { validationToken, requirements } = await fp.verify({ verificationCode });
      console.log({ validationToken, requirements });
      onDone();
    } catch (e) {
      console.log(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      {showOtp ? (
        <Stack flexDirection="column" textAlign="center" alignItems="center">
          <Box marginBottom={7}>
            <Text variant="heading-3">Verify your phone number</Text>
            <Text variant="body-3" color="secondary">
              Enter the 6-digit code sent to {phoneNumber}.
            </Text>
          </Box>
          <Fp.PinInput onComplete={handleSubmitPin} autoFocus />
          {busy ? (
            <Box marginTop={6}>
              <LoadingSpinner />
            </Box>
          ) : null}
        </Stack>
      ) : (
        <>
          <Box marginBottom={7}>
            <Text variant="heading-3">Identification</Text>
            <Text variant="body-3" color="secondary">
              Please provide your email and phone number
            </Text>
          </Box>
          <Fp.Form onSubmit={handleSubmitData}>
            <Stack gap={5} direction="column">
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
              <Divider marginBlock={3} />
              <Button type="submit" disabled={busy}>
                {busy ? 'Loading...' : 'Continue'}
              </Button>
            </Stack>
          </Fp.Form>
        </>
      )}
    </Layout>
  );
};

const PersonalData = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (formValues: FormValues) => {
    try {
      setBusy(true);
      await fp.vault(formValues);
      onDone();
    } catch (e) {
      console.log(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <Box marginBottom={7}>
        <Text variant="heading-3">Personal information</Text>
        <Text variant="body-3" color="secondary">
          Please provide your personal details
        </Text>
      </Box>
      <Fp.Form onSubmit={handleSubmit}>
        <Stack gap={5} direction="column">
          <Fp.Field name="id.first_name">
            <Fp.Label>First name</Fp.Label>
            <Fp.Input placeholder="Jane" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.middle_name">
            <Fp.Label>Middle name</Fp.Label>
            <Fp.Input placeholder="Sue" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.last_name">
            <Fp.Label>Last name</Fp.Label>
            <Fp.Input placeholder="Joe" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.dob">
            <Fp.Label>DOB</Fp.Label>
            <Fp.Input placeholder="MM/DD/YYYY" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.ssn9">
            <Fp.Label>SSN</Fp.Label>
            <Fp.Input placeholder="XXX-XX-XXXX" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <Button type="submit" disabled={busy}>
            {busy ? 'Loading...' : 'Continue'}
          </Button>
        </Stack>
      </Fp.Form>
    </Layout>
  );
};

const Address = ({ onDone }: { onDone: (validationToken: string) => void }) => {
  const fp = useFootprint();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (formValues: FormValues) => {
    setBusy(true);
    try {
      await fp.vault(formValues);
      const { validationToken } = await fp.process();
      onDone(validationToken);
    } catch (e) {
      if (e instanceof InlineProcessError) {
        fp.handoff({ onComplete: onDone });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <Box marginBottom={7}>
        <Text variant="heading-3">Address information</Text>
        <Text variant="body-3" color="secondary">
          Please provide your address details
        </Text>
      </Box>
      <Fp.Form onSubmit={handleSubmit}>
        <Stack gap={5} direction="column">
          <Fp.Field name="id.country">
            <Fp.Input placeholder="US" defaultValue="US" type="hidden" />
          </Fp.Field>
          <Fp.Field name="id.address_line1">
            <Fp.Label>Address line 1</Fp.Label>
            <Fp.Input placeholder="Street number" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.address_line2">
            <Fp.Label>Address line 2 (optional)</Fp.Label>
            <Fp.Input placeholder="Apartment, suite, etc." />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.city">
            <Fp.Label>City</Fp.Label>
            <Fp.Input placeholder="New York" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.state">
            <Fp.Label>State</Fp.Label>
            <Fp.Input placeholder="NY" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.zip">
            <Fp.Label>Zip</Fp.Label>
            <Fp.Input placeholder="11206" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <Button type="submit" disabled={busy}>
            {busy ? 'Loading...' : 'Continue'}
          </Button>
        </Stack>
      </Fp.Form>
    </Layout>
  );
};

const Success = () => (
  <Layout>
    <Box marginBottom={7}>
      <Text variant="heading-3">Success</Text>
      <Text variant="body-3" color="secondary">
        You are all set!
      </Text>
    </Box>
  </Layout>
);

export default Demo;
