import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import type { ContentSchemaNoRef, ResponseHeader } from 'src/pages/api-reference/api-reference.types';
import { SchemaBody } from './schema';

type ResponseHeadersProps = {
  headers?: Record<string, ResponseHeader>;
};

const ResponseHeaders = ({ headers }: ResponseHeadersProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });

  if (!headers || !Object.keys(headers).length) {
    return null;
  }

  /// Make a fake schema to render the response headers
  const requiredHeaders = Object.keys(headers);
  const headersSchema: ContentSchemaNoRef = {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(headers).map(([name, header]) => {
        const headerSchema: ContentSchemaNoRef = {
          description: header.description,
          type: 'string',
        };
        return [name, headerSchema];
      }),
    ),
    required: requiredHeaders,
  };
  return (
    <Stack direction="column" gap={2}>
      <Text variant="label-1" color="secondary">
        {t('header-parameters')}
      </Text>
      <SchemaBody schema={headersSchema} />
    </Stack>
  );
};

export default ResponseHeaders;
