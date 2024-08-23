import { Box, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { ContentSchemaNoRef, RequestOrResponse } from 'src/pages/api-reference/api-reference.types';

import Description from './description';
import Schema from './schema';

type RequestBodyProps = {
  requestBody: RequestOrResponse<ContentSchemaNoRef>;
};

const RequestBody = ({ requestBody }: RequestBodyProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const isOptional = !requestBody.required;

  return requestBody ? (
    <Stack direction="column" gap={2}>
      <Stack gap={2} alignItems="center">
        <Text variant="label-1" color="secondary">
          {t('body')}
        </Text>
        {isOptional && (
          <>
            <Separator>·</Separator>
            <Text variant="snippet-3" color="quaternary">
              {t('optional')}
            </Text>
          </>
        )}
      </Stack>
      {requestBody.description && <Description>{requestBody.description}</Description>}
      <Box marginLeft={3}>
        <Schema schema={requestBody.content} isInBrackets />
      </Box>
    </Stack>
  ) : null;
};

const Separator = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    padding: 0 ${theme.spacing[2]};
  `}
`;

export default RequestBody;
