import type { FormValues } from '@onefootprint/footprint-react';
import { Fp, InlineOtpNotSupported, InlineProcessError, useFootprint } from '@onefootprint/footprint-react';
import { Box, Button, Container, Divider, LoadingSpinner, Stack, Stepper, Text } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
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
    label: 'SSN',
    value: 'ssn',
  },
  {
    label: 'Confirmation',
    value: 'confirmation',
  },
];

const publicKeyEnv = 'pb_test_2i5Sl82d7NQOnToRYrD2dx';

const Demo = () => {
  const [option, setOption] = useState(steps[0]);

  const isIdentify = option.value === 'identify';
  const isPersonalData = option.value === 'personal-data';
  const isAddress = option.value === 'address';
  const isSsn = option.value === 'ssn';
  const isSuccess = option.value === 'confirmation';

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.value === option.value);
    if (currentIndex > 0) {
      setOption(steps[currentIndex - 1]);
    }
  };

  return (
    <>
      <GlobalStyles />
      <Fp.Provider
        publicKey={publicKeyEnv}
        sandboxId="9876523243212209"
        // sandboxOutcome={{
        //   overallOutcome: 'step_up',
        // }}
      >
        <Header>Onboarding</Header>
        <Container>
          <Stack marginTop={7} gap={8}>
            <Stepper onChange={() => undefined} value={{ option }} aria-label="Steps" options={steps} />
            <Box>
              {isIdentify && (
                <Identify
                  onDone={(nextStep = 1) => {
                    setOption(steps[nextStep]);
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
                  onDone={() => {
                    setOption(steps[3]);
                  }}
                  onBack={handleBack}
                />
              )}
              {isSsn && (
                <Ssn
                  onDone={(validationToken: string) => {
                    console.log(validationToken);
                    setOption(steps[4]);
                  }}
                  onBack={handleBack}
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

const Identify = ({ onDone }: { onDone: (step?: number) => void }) => {
  const fp = useFootprint();
  const [showOtp, setShowOtp] = useState(false);
  const createChallengeMutation = useMutation({
    mutationFn: (data: { email: string; phoneNumber: string }) => fp.createEmailPhoneBasedChallenge(data),
  });
  const verifyMutation = useMutation({
    mutationFn: (verificationCode: string) => fp.verify({ verificationCode }),
  });

  const handleSubmitData = async (formValues: FormValues) => {
    const email = formValues['id.email'];
    const phoneNumber = formValues['id.phone_number'];
    if (!email || !phoneNumber) return null;

    try {
      await createChallengeMutation.mutateAsync({ email, phoneNumber });
      setShowOtp(true);
    } catch (e) {
      if (e instanceof InlineOtpNotSupported) {
        await fp.launchIdentify(
          { email: phoneNumber, phoneNumber },
          {
            onAuthenticated() {
              onDone();
            },
          },
        );
      }
    }
  };

  const handleSubmitPin = async (verificationCode: string) => {
    try {
      const response = await verifyMutation.mutateAsync(verificationCode);
      const isBasicDataCompleted =
        response.vaultData['id.first_name'] && response.vaultData['id.last_name'] && response.vaultData['id.dob'];
      onDone(isBasicDataCompleted ? 2 : 1);
      onDone();
    } catch (error) {
      console.error('Error verifying pin:', error);
      // Handle the error appropriately
    }
  };

  return (
    <Layout>
      {showOtp ? (
        <Stack flexDirection="column" textAlign="center" alignItems="center">
          <Box marginBottom={7}>
            <Text variant="heading-3">Verify your phone number</Text>
            <Text variant="body-3" color="secondary">
              Enter the 6-digit code sent to your phone
            </Text>
          </Box>
          <Fp.PinInput onComplete={handleSubmitPin} autoFocus />
          {verifyMutation.isPending && (
            <Box marginTop={6}>
              <LoadingSpinner />
            </Box>
          )}
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
              <Button type="submit" disabled={createChallengeMutation.isPending}>
                {createChallengeMutation.isPending ? 'Loading...' : 'Continue'}
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
  const { vaultData } = fp.data;

  const vaultMutation = useMutation({
    mutationFn: (formValues: FormValues) => fp.vault(formValues),
  });

  const handleSubmit = async (formValues: FormValues) => {
    try {
      await vaultMutation.mutateAsync(formValues);
      onDone();
    } catch (error) {
      console.error('Error vaulting personal data:', error);
      // Handle the error appropriately
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
      <Fp.Form
        onSubmit={handleSubmit}
        defaultValues={{
          'id.first_name': vaultData?.['id.first_name'],
          'id.middle_name': vaultData?.['id.middle_name'],
          'id.last_name': vaultData?.['id.last_name'],
          'id.dob': vaultData?.['id.dob'],
        }}
      >
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
          <Divider marginBlock={3} />
          <Button type="submit" disabled={vaultMutation.isPending}>
            {vaultMutation.isPending ? 'Loading...' : 'Continue'}
          </Button>
        </Stack>
      </Fp.Form>
    </Layout>
  );
};

const Address = ({ onDone, onBack }: { onDone: () => void; onBack: () => void }) => {
  const fp = useFootprint();
  const { vaultData } = fp.data;

  const vaultMutation = useMutation({
    mutationFn: (formValues: FormValues) => fp.vault(formValues),
  });

  const handleSubmit = async (formValues: FormValues) => {
    try {
      await vaultMutation.mutateAsync(formValues);
      onDone();
    } catch (error) {
      console.error('Error vaulting address data:', error);
      // Handle the error appropriately
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
      <Fp.Form
        onSubmit={handleSubmit}
        defaultValues={{
          'id.country': vaultData?.['id.country'] || 'US',
          'id.address_line1': vaultData?.['id.address_line1'],
          'id.address_line2': vaultData?.['id.address_line2'],
          'id.city': vaultData?.['id.city'],
          'id.state': vaultData?.['id.state'],
          'id.zip': vaultData?.['id.zip'],
        }}
      >
        <Stack gap={5} direction="column">
          <Fp.Field name="id.country">
            <Fp.Input placeholder="US" defaultValue="US" type="hidden" />
          </Fp.Field>
          <Fp.Field name="id.address_line1">
            <Fp.Label>Address line 1</Fp.Label>
            <Fp.Input placeholder="Street number" autoFocus />
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
          <Stack direction="row" gap={3}>
            <Button onClick={onBack} variant="secondary" fullWidth>
              Back
            </Button>
            <Button type="submit" disabled={vaultMutation.isPending} fullWidth>
              {vaultMutation.isPending ? 'Loading...' : 'Continue'}
            </Button>
          </Stack>
        </Stack>
      </Fp.Form>
    </Layout>
  );
};

const Ssn = ({ onDone, onBack }: { onDone: (validationToken: string) => void; onBack: () => void }) => {
  const fp = useFootprint();
  const { vaultData } = fp.data;
  const processMutation = useMutation({
    mutationFn: async (formValues: FormValues) => {
      await fp.vault(formValues);
      return fp.process();
    },
  });

  const handleSubmit = async (formValues: FormValues) => {
    try {
      const { validationToken } = await processMutation.mutateAsync(formValues);
      onDone(validationToken);
    } catch (e) {
      if (e instanceof InlineProcessError) {
        fp.handoff({ onComplete: onDone });
      }
    }
  };

  return (
    <Layout>
      <Box marginBottom={7}>
        <Text variant="heading-3">Social Security Number</Text>
        <Text variant="body-3" color="secondary">
          Please provide your SSN
        </Text>
      </Box>
      <Fp.Form
        onSubmit={handleSubmit}
        defaultValues={{
          'id.ssn9': vaultData?.['id.ssn9'],
        }}
      >
        <Stack gap={5} direction="column">
          <Fp.Field name="id.ssn9">
            <Fp.Label>SSN</Fp.Label>
            <Fp.Input placeholder="XXX-XX-XXXX" autoFocus />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <Stack direction="row" gap={3}>
            <Button onClick={onBack} variant="secondary" fullWidth>
              Back
            </Button>
            <Button type="submit" disabled={processMutation.isPending} fullWidth>
              {processMutation.isPending ? 'Loading...' : 'Continue'}
            </Button>
          </Stack>
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
