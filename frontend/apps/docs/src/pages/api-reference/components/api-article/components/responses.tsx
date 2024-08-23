import { Box, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import type { ContentSchemaNoRef, RequestOrResponse } from 'src/pages/api-reference/api-reference.types';

import Description from './description';
import ResponseHeaders from './response-headers';
import Schema from './schema';

export type ResponsesProps = {
  responses: Record<string, RequestOrResponse<ContentSchemaNoRef>>;
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
  const [_, response] = Object.entries(responses)[0];

  if (!response) {
    return;
  }

  const hasHeaders = Object.keys(response.headers || {}).length;

  return (
    <Stack direction="column" gap={5}>
      <Stack direction="column" gap={4}>
        <Text variant="heading-3">{t('response')}</Text>
        {/* Add a body header when we're rendering both a body and headers */}
        {hasHeaders ? (
          <Text variant="label-1" color="secondary">
            {t('body')}
          </Text>
        ) : null}
        {response.content.description && <Description>{response.content.description}</Description>}
        <Box marginLeft={3}>
          <Schema schema={response.content} isInBrackets />
        </Box>
      </Stack>
      <ResponseHeaders headers={response.headers} />
    </Stack>
  );
};

export default Responses;
