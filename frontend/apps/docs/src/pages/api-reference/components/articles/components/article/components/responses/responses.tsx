import { Box, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import type { ContentSchemaNoRef } from '@/api-reference/api-reference.types';

import Description from '../description';
import Schema from '../schema';

export type ResponsesProps = {
  responses: Record<string, ContentSchemaNoRef>;
};

const Responses = ({ responses }: ResponsesProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  if (Object.keys(responses).length === 0) {
    return null;
  }
  if (Object.keys(responses).length > 1) {
    // We have an assertion in update_open_api.py that we only have one response per API
    console.error('Multiple responses for API');
  }
  const [_, schema] = Object.entries(responses)[0];

  if (!schema) {
    return;
  }
  return (
    <Stack direction="column" gap={3}>
      <Text variant="heading-3">{t('response')}</Text>
      {schema.description && <Description>{schema.description}</Description>}
      <Box marginLeft={3}>
        <Schema schema={schema} isInBrackets />
      </Box>
    </Stack>
  );
};

export default Responses;
