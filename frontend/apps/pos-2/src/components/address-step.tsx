import Header from '@/components/header';
import { Box, Button, Form, Stack } from '@onefootprint/ui';

const AddressStep = () => {
  return (
    <Stack direction="column" gap={7} textAlign="center" width="100%" alignItems="center">
      <Header
        title="What's their residential address?"
        subtitle="We need to collect this information to verify their identity."
      />
      <Box width="100%">
        <form>
          <Stack flexDirection="column" gap={7} width="100%">
            <Form.Field>
              <Form.Label>Country</Form.Label>
              <Form.Select>
                <option>United States</option>
              </Form.Select>
            </Form.Field>
            <Form.Field>
              <Form.Label>Address line 1</Form.Label>
              <Form.Input placeholder="Street and house number" />
            </Form.Field>
            <Form.Field>
              <Form.Label>Address line 2</Form.Label>
              <Form.Input placeholder="Apartment, suite, etc." />
            </Form.Field>
            <Stack gap={4}>
              <Form.Field>
                <Form.Label>City</Form.Label>
                <Form.Input placeholder="Brooklyn" />
              </Form.Field>
              <Form.Field>
                <Form.Label>Zip code</Form.Label>
                <Form.Input placeholder="11206" />
              </Form.Field>
            </Stack>
            <Form.Field>
              <Form.Label>State</Form.Label>
              <Form.Select>
                <option>NY</option>
              </Form.Select>
            </Form.Field>
            <Button size="large">Continue</Button>
          </Stack>
        </form>
      </Box>
    </Stack>
  );
};

export default AddressStep;
