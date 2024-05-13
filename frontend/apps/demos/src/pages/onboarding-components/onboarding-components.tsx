import CustomSelect, {
  AddressInput,
  CustomInput,
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
import { useRouter } from 'next/router';
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
    label: 'Personal information',
    value: 'basic-data',
  },
  {
    label: 'Drive information',
    value: 'custom-data',
  },
  {
    label: 'Confirmation',
    value: 'confirmation',
  },
];

const publicKeyEnv =
  process.env.NEXT_PUBLIC_TENANT_KEY || 'pb_test_B1Q1ubKxYEpx3uKdGaXLQ2';

const Demo = () => {
  const [option, setOption] = useState(steps[0]);
  const router = useRouter();
  const { ob_key: obKey } = router.query;
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;

  const isIdentify = option.value === 'identify';
  const isBasicData = option.value === 'basic-data';
  const isCustomData = option.value === 'custom-data';
  const isSuccess = option.value === 'confirmation';

  return (
    <>
      <GlobalStyles />
      <Provider
        publicKey={publicKey}
        onComplete={() => {
          setOption(steps[3]);
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
              {isBasicData && (
                <BasicData
                  onDone={() => {
                    setOption(steps[2]);
                  }}
                />
              )}
              {isCustomData && <CustomData />}
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

const BasicData = ({ onDone }: { onDone: () => void }) => {
  const fp = useFootprint();
  const saveMutation = useRequest(fp.save);

  const handleSubmit = () => {
    saveMutation.mutate({
      onSuccess: onDone,
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
          <Divider marginBlock={3} />
          <AddressInput />
          <Divider marginBlock={3} />
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

const CustomData = () => {
  const fp = useFootprint();
  const saveMutation = useRequest(fp.save);

  const handleSubmit = () => {
    saveMutation.mutate({
      onSuccess: () => {
        fp.handoff();
      },
    });
  };

  return (
    <Layout>
      <Box marginBottom={7}>
        <Text variant="heading-3">Driver information</Text>
        <Text variant="body-3" color="secondary">
          Please provide some driver information
        </Text>
      </Box>
      <Form onSubmit={handleSubmit}>
        <Stack gap={4} direction="column">
          <CustomInput
            label="Make"
            identifier="custom.make"
            placeholder="Toyota, Ford, Honda"
            validations={{
              required: 'Make is required',
            }}
          />
          <CustomInput
            label="Model"
            identifier="custom.model"
            placeholder="Corolla, F-150, Civic"
            validations={{
              required: 'Model is required',
            }}
          />
          <CustomSelect
            label="Year"
            identifier="custom.year"
            placeholder="Select..."
            validations={{
              required: 'Year is required',
            }}
          >
            {Array.from({ length: 65 }, (_, i) => 2024 - i).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </CustomSelect>
          <CustomInput
            identifier="custom.insurance"
            label="Insurance policy number"
            mask={{
              blocks: [4, 3, 3, 4],
            }}
            name="insurance"
            placeholder="Policy number"
          />
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
