import { Di, Fp, useFootprint } from '@onefootprint/footprint-react';
import { Box, Button, Container, Divider, InlineAlert, Stack, Stepper, Text } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import Header from './components/header';
import Layout from './components/layout';
import GlobalStyles from './kyb.styles';

const steps = [
  {
    label: 'Identify',
    value: 'identify',
  },
  {
    label: 'Business information',
    value: 'business-data',
  },
  {
    label: "BO's information",
    value: 'bo-data',
  },
  {
    label: 'Personal information',
    value: 'personal-data',
  },
  {
    label: 'Confirmation',
    value: 'confirmation',
  },
];

const publicKeyEnv = process.env.NEXT_PUBLIC_KYB_KEY || 'pb_test_5m3aRbmk381xA4dSl5ln4n';

const Demo = () => {
  const [option, setOption] = useState(steps[0]);
  const router = useRouter();
  const { ob_key: obKey } = router.query;
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;

  const isIdentify = option.value === 'identify';
  const isBusinessData = option.value === 'business-data';
  const isBoData = option.value === 'bo-data';
  const isPersonalData = option.value === 'personal-data';
  const isSuccess = option.value === 'confirmation';

  return (
    <>
      <GlobalStyles />
      <Fp.Provider
        publicKey={publicKey}
        onComplete={() => {
          setOption(steps[4]);
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
              {isBusinessData && (
                <BusinessData
                  onDone={() => {
                    setOption(steps[2]);
                  }}
                />
              )}
              {isBoData && (
                <BoData
                  onDone={() => {
                    setOption(steps[3]);
                  }}
                />
              )}
              {isPersonalData && <PersonalData />}
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

  const handleSubmit = (formValues: Di) => {
    fp.launchIdentify(
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

const BusinessData = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();

  const handleSubmit = (data: Di) => {
    fp.save(data, { onSuccess: onDone });
  };

  return (
    <Layout>
      <Box marginBottom={7}>
        <Text variant="heading-3">Business information</Text>
        <Text variant="body-3" color="secondary">
          Let's get to know your business! 😊
        </Text>
      </Box>
      <Fp.Form onSubmit={handleSubmit}>
        <Stack gap={4} direction="column">
          <Fp.Field name="business.name">
            <Fp.Label>Business name1</Fp.Label>
            <Fp.Input placeholder="Acme Bank Inc." />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.dba">
            <Fp.Label>Doing Business As (optional)</Fp.Label>
            <Fp.Input placeholder="Acme Bank" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.tin">
            <Fp.Label>Taxpayer Identification Number (TIN)</Fp.Label>
            <Fp.Input placeholder="12-3456789" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <Fp.Field name="business.country">
            <Fp.Label>Country</Fp.Label>
            <Fp.Input placeholder="US" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.address_line1">
            <Fp.Label>Address line 1</Fp.Label>
            <Fp.Input placeholder="Street number" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.address_line2">
            <Fp.Label>Address line 2 (optional)</Fp.Label>
            <Fp.Input placeholder="Apartment, suite, etc." />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.city">
            <Fp.Label>City</Fp.Label>
            <Fp.Input placeholder="New York" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.state">
            <Fp.Label>State</Fp.Label>
            <Fp.Input placeholder="NY" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.zip">
            <Fp.Label>Zip</Fp.Label>
            <Fp.Input placeholder="11206" />
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

const BoData = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();

  const handleSubmit = (data: Di) => {
    fp.save(data, { onSuccess: onDone });
  };

  return (
    <Layout>
      <Box marginBottom={7}>
        <Text variant="heading-3">Who are the beneficial owners?</Text>
        <Text variant="body-3" color="secondary">
          List all individuals who own at least 25% of the business or have substantial control over the business.
        </Text>
      </Box>
      <Fp.Form onSubmit={handleSubmit}>
        <InlineAlert variant="info" marginBottom={4}>
          Spell your first, middle and last names exactly as shown on your government-issued ID
        </InlineAlert>
        <Stack gap={4} direction="column">
          <Fp.Field name="business.beneficial_owners[0].first_name">
            <Fp.Label>First name</Fp.Label>
            <Fp.Input placeholder="Jane" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.beneficial_owners[0].middle_name">
            <Fp.Label>Middle name (optional)</Fp.Label>
            <Fp.Input placeholder="Sue" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.beneficial_owners[0].last_name">
            <Fp.Label>Last name</Fp.Label>
            <Fp.Input placeholder="Doe" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="business.beneficial_owners[0].ownership_stake">
            <Fp.Label>Approximate ownership stake (%)</Fp.Label>
            <Fp.Input placeholder="50" />
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

const PersonalData = () => {
  const fp = useFootprint();

  const handleSubmit = (data: Di) => {
    fp.save(data, { onSuccess: fp.handoff });
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
            <Fp.Label>Country</Fp.Label>
            <Fp.Input placeholder="US" />
            <Fp.FieldErrors />
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

export default Demo;
