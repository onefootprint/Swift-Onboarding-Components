import type { FormValues } from '@onefootprint/footprint-react';
import { Fp, useFootprint, useOtp } from '@onefootprint/footprint-react';
import { Box, Button, Container, Divider, Shimmer, Stack, Stepper, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
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
    label: 'Confirmation',
    value: 'confirmation',
  },
];

const publicKeyEnv = process.env.NEXT_PUBLIC_KYC_KEY || 'pb_test_DOBM63fG6uDzNUj62SRJkF';

const Demo = () => {
  const [option, setOption] = useState(steps[0]);
  const router = useRouter();
  const { ob_key: obKey } = router.query;
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;

  const isIdentify = option.value === 'identify';
  const isPersonalData = option.value === 'personal-data';
  const isSuccess = option.value === 'confirmation';

  if (!router.isReady) return <Loading />;

  return (
    <>
      <GlobalStyles />
      <Fp.Provider publicKey={publicKey}>
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
              {isSuccess && <Success />}
            </Box>
          </Stack>
        </Container>
      </Fp.Provider>
    </>
  );
};

const Identify = ({ onDone }: { onDone: () => void }) => {
  const otp = useOtp();

  const handleSubmit = (formValues: FormValues) => {
    otp.launchIdentify(
      {
        email: formValues['id.email'],
        phoneNumber: formValues['id.phone_number'],
      },
      { onAuthenticated: onDone },
    );
  };

  return (
    <Layout>
      <Box marginBottom={7}>
        <Text variant="heading-3">Identification</Text>
        <Text variant="body-3" color="secondary">
          Please provide your email and phone number
        </Text>
      </Box>
      <Fp.Form onSubmit={handleSubmit}>
        <Stack gap={4} direction="column">
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
          <Button type="submit">Continue</Button>
        </Stack>
      </Fp.Form>
    </Layout>
  );
};

const PersonalData = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();

  const handleSubmit = (data: FormValues) => {
    fp.save(data, { onSuccess: () => fp.handoff({ onComplete: onDone }) });
  };

  return (
    <Layout>
      <Box marginBottom={7}>
        <Text variant="heading-3">Basic information</Text>
        <Text variant="body-3" color="secondary">
          Please provide some basic personal information
        </Text>
      </Box>
      <Fp.Form onSubmit={handleSubmit}>
        <Stack gap={4} direction="column">
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
          <Fp.Field name="id.ssn9">
            <Fp.Label>SSN</Fp.Label>
            <Fp.Input placeholder="XXX-XX-XXXX" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <Button type="submit" loading={fp.busy === 'save'}>
            Continue
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

const Loading = () => {
  return (
    <Stack direction="row" width="100%">
      <Stack direction="column" width="100%">
        <Stack direction="column" width="100%" alignItems="center">
          <Shimmer height="32px" width="160px" marginBottom={4} marginTop={4} />
          <Divider />
        </Stack>
        <Container>
          <Stack marginTop={7} gap={8}>
            <Stack direction="column" width="30%" gridArea="left">
              <Shimmer height="24px" width="160px" marginBottom={4} />
              <Shimmer height="24px" width="160px" marginBottom={4} />
              <Shimmer height="24px" width="160px" />
            </Stack>
            <Stack direction="column" width="100%" maxWidth="480px" gridArea="center" alignItems="left">
              <Shimmer height="32px" width="300px" marginBottom={5} />
              <Shimmer height="16px" width="100px" marginBottom={2} />
              <Shimmer height="32px" width="100%" marginBottom={5} />
              <Shimmer height="16px" width="100px" marginBottom={2} />
              <Shimmer height="32px" width="100%" marginBottom={5} />
              <Divider />
              <Shimmer height="32px" width="100%" marginTop={5} />
            </Stack>
          </Stack>
        </Container>
      </Stack>
    </Stack>
  );
};

export default Demo;
