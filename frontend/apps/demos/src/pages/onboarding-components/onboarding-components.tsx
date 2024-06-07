import { Fp, useFootprint } from '@onefootprint/footprint-react';
import { Box, Button, Container, Divider, Stack, Stepper, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import Header from './components/header';
import Layout from './components/layout';
import GlobalStyles from './onboarding-components.styles';

const steps = [
  {
    label: 'Identify',
    value: 'identify',
  },
  {
    label: 'Personal information',
    value: 'basic-data',
  },
  {
    label: 'Confirmation',
    value: 'confirmation',
  },
];

const publicKeyEnv = process.env.NEXT_PUBLIC_TENANT_KEY || 'pb_test_B1Q1ubKxYEpx3uKdGaXLQ2';

const Demo = () => {
  const [option, setOption] = useState(steps[0]);
  const router = useRouter();
  const { ob_key: obKey } = router.query;
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;

  const isIdentify = option.value === 'identify';
  const isBasicData = option.value === 'basic-data';
  const isSuccess = option.value === 'confirmation';

  return (
    <>
      <GlobalStyles />
      <Fp.Provider
        publicKey={publicKey}
        onComplete={() => {
          setOption(steps[3]);
        }}
      >
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
              {isBasicData && (
                <BasicData
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
  const fp = useFootprint();

  const handleSubmit = () => {
    fp.launchIdentify({ onAuthenticated: onDone });
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
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.phone_number">
            <Fp.Label>Phone</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <Button type="submit">Continue</Button>
        </Stack>
      </Fp.Form>
    </Layout>
  );
};

const BasicData = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();

  const handleSubmit = () => {
    fp.save({
      onSuccess: () => {
        fp.handoff({
          onComplete: onDone,
        });
      },
    });
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
          <Divider marginBlock={3} />
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
          <Fp.Field name="id.state">
            <Fp.Label>State</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.zip">
            <Fp.Label>Zip</Fp.Label>
            <Fp.Input />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <Fp.Field name="id.ssn9">
            <Fp.Label>SSN</Fp.Label>
            <Fp.Input />
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

export default Demo;
