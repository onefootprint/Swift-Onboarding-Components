import Header from '@/components/header';
import { Box, Button, Form, Stack } from '@onefootprint/ui';

const BasicStep = () => {
  return (
    <Stack direction="column" gap={7} textAlign="center" width="100%" alignItems="center">
      <Header title="Basic data" subtitle="We're legally required to collect this information." />
      <Box width="100%">
        <form>
          <Stack flexDirection="column" gap={7} width="100%">
            <Stack gap={4}>
              <Form.Field>
                <Form.Label>First name</Form.Label>
                <Form.Input placeholder="John" />
              </Form.Field>
              <Form.Field>
                <Form.Label>Middle name</Form.Label>
                <Form.Input placeholder="Robert" />
              </Form.Field>
            </Stack>
            <Form.Field>
              <Form.Label>Last name</Form.Label>
              <Form.Input placeholder="Doe" />
            </Form.Field>
            <Form.Field>
              <Form.Label>Date of birth</Form.Label>
              <Form.Input placeholder="MM/DD/YYYY" />
            </Form.Field>
            <Button size="large">Continue</Button>
          </Stack>
        </form>
      </Box>
    </Stack>
  );
};

export default BasicStep;
