import Header from '@/components/header';
import { Box, Button, Form, Stack } from '@onefootprint/ui';

const EmailStep = () => {
  return (
    <Stack direction="column" gap={7} textAlign="center" width="100%" alignItems="center">
      <Header title="What's their email address?" subtitle="Enter their email to get started." />
      <Box width="100%">
        <form>
          <Stack flexDirection="column" gap={7} width="100%">
            <Form.Field>
              <Form.Label>Email</Form.Label>
              <Form.Input type="email" placeholder="your@email.com" autoFocus />
            </Form.Field>
            <Button size="large">Continue</Button>
          </Stack>
        </form>
      </Box>
    </Stack>
  );
};

export default EmailStep;
