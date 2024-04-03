import {
  AddressInput,
  DobInput,
  EmailInput,
  FirstNameInput,
  Form,
  LastNameInput,
  MiddleNameInput,
  PhoneInput,
  Provider,
  SSN9Input,
  useFootprint,
} from '@onefootprint/components';
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Stepper,
  Text,
} from '@onefootprint/ui';
import React, { useState } from 'react';

import Header from './components/header';
import Layout from './components/layout';
import useRequest from './hooks/use-request';
import GlobalStyles from './onboarding-components.styles';

const steps = [
  {
    label: 'Identify',
    value: 'identify',
  },
  {
    label: 'Collect Data',
    value: 'collect-data',
  },
  {
    label: 'Confirmation',
    value: 'confirmation',
  },
];

const publicKey =
  process.env.NEXT_PUBLIC_TENANT_KEY || 'pb_test_B1Q1ubKxYEpx3uKdGaXLQ2';

const Demo = () => {
  const [option, setOption] = useState(steps[0]);
  const isIdentify = option.value === 'identify';
  const isData = option.value === 'collect-data';
  const isSuccess = option.value === 'confirmation';

  return (
    <>
      <GlobalStyles />
      <Provider
        publicKey={publicKey}
        onComplete={() => {
          setOption(steps[2]);
        }}
      >
        <Header>Onboarding</Header>
        <Container>
          <Stack marginTop={7} gap={8}>
            <Stepper
              onChange={() => {}}
              value={{ option }}
              aria-label="Steps"
              options={steps}
            />
            <Box>
              {isIdentify && (
                <Identify
                  onDone={() => {
                    setOption(steps[1]);
                  }}
                />
              )}

              {isData && (
                <CollectData
                  onDone={() => {
                    setOption(steps[1]);
                  }}
                />
              )}

              {isSuccess && <Success />}
            </Box>
          </Stack>
        </Container>
      </Provider>
    </>
  );
};

const Identify = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();

  const handleSubmit = () => {
    fp.launchIdentify({ onDone });
  };

  return (
    <Layout>
      <Box marginBottom={7}>
        <Text variant="heading-3">Identification</Text>
        <Text variant="body-3" color="secondary">
          Please provide your email and phone number
        </Text>
      </Box>
      <Form onSubmit={handleSubmit}>
        <Stack gap={4} direction="column">
          <EmailInput />
          <PhoneInput />
          <Divider marginBlock={3} />
          <Button type="submit">Continue</Button>
        </Stack>
      </Form>
    </Layout>
  );
};

const CollectData = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();
  const saveMutation = useRequest(fp.save);

  const handleSubmit = () => {
    saveMutation.mutate({
      onSuccess: () => {
        fp.handoff();
        onDone();
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
      <Form onSubmit={handleSubmit}>
        <Stack gap={4} direction="column">
          <FirstNameInput />
          <MiddleNameInput />
          <LastNameInput />
          <DobInput />
          <AddressInput />
          <SSN9Input />
          <Divider marginBlock={3} />
          <Button type="submit" loading={saveMutation.loading}>
            Continue
          </Button>
        </Stack>
      </Form>
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
