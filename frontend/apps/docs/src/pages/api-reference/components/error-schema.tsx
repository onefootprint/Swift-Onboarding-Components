import { Box, Stack, Text } from '@onefootprint/ui';
import { ContentSchemaNoRef } from '../api-reference.types';
import Schema from './api-article/components/schema';

const ERROR_OPEN_API_SPEC: ContentSchemaNoRef = {
  properties: {
    message: { type: 'string', description: 'Human-readable description of the error.' },
    code: {
      type: 'string',
      description: 'For some errors that can be handled programatically, a short string indicating the error reported.',
    },
    context: {
      type: 'object',
      description: 'For some errors that can be handled programatically, an optional object with relevant context.',
    },
  },
  required: ['message'],
  type: 'object',
};

/** To allow us to render our fixed error response's schema in markdown, this simple component renders the error response's schema. */
const ErrorSchema = () => {
  return (
    <Stack direction="column" gap={2}>
      <Text variant="label-1" color="secondary">
        Error responses
      </Text>
      <Box marginLeft={3}>
        <Schema isInBrackets schema={ERROR_OPEN_API_SPEC}></Schema>
      </Box>
    </Stack>
  );
};

export default ErrorSchema;
